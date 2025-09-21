/**
 * Authentication API service with dynamic backend configuration
 */

// Types
export interface LoginCredentials {
  username: string;
  password: string;
  captchaToken?: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  captchaToken?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export interface LoginResponse extends AuthResponse {
  data?: {
    access_token: string;
    token_type: string;
    user_id: string;
    session_uid: string;
  };
}

export interface RegisterResponse extends AuthResponse {
  data?: {
    user_id: string;
    username: string;
    session_uid: string;
  };
}

// Environment configuration helper
class BackendConfig {
  private static getEnvVar(key: string, fallback?: string): string {
    const value = process.env[key];
    if (!value && !fallback) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return value || fallback || '';
  }

  static get baseURL(): string {
    return this.getEnvVar('NEXT_PUBLIC_BACKEND_BASE_URL', 'http://localhost:8000');
  }

  static get protocol(): string {
    return this.getEnvVar('NEXT_PUBLIC_BACKEND_PROTOCOL', 'http');
  }

  static get host(): string {
    return this.getEnvVar('NEXT_PUBLIC_BACKEND_HOST', 'localhost');
  }

  static get port(): string {
    return this.getEnvVar('NEXT_PUBLIC_BACKEND_PORT', '8000');
  }

  static buildURL(endpoint: string): string {
    // Use baseURL if available, otherwise construct from parts
    const base = this.baseURL || `${this.protocol}://${this.host}:${this.port}`;
    return `${base}${endpoint}`;
  }

  // Endpoint getters
  static get registerEndpoint(): string {
    return this.getEnvVar('NEXT_PUBLIC_AUTH_REGISTER_ENDPOINT', '/register');
  }

  static get loginEndpoint(): string {
    return this.getEnvVar('NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT', '/login');
  }

  static get logoutEndpoint(): string {
    return this.getEnvVar('NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT', '/logout');
  }

  static get meEndpoint(): string {
    return this.getEnvVar('NEXT_PUBLIC_AUTH_ME_ENDPOINT', '/me');
  }

  static get healthEndpoint(): string {
    return this.getEnvVar('NEXT_PUBLIC_BACKEND_HEALTH_ENDPOINT', '/health');
  }
}

// Session storage helpers
export class SessionManager {
  private static readonly USER_KEY = 'documint_user';
  private static readonly TOKEN_KEY = 'documint_token';
  private static readonly SESSION_KEY = 'documint_session';
  private static readonly LAST_VALIDATION_KEY = 'documint_last_validation';
  private static readonly VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes
  
  private static validationPromise: Promise<boolean> | null = null;

  static saveSession(data: {
    user_id: string;
    username?: string;
    session_uid: string;
    access_token: string;
  }): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify({
        user_id: data.user_id,
        username: data.username,
        session_uid: data.session_uid
      }));
      localStorage.setItem(this.TOKEN_KEY, data.access_token);
      localStorage.setItem(this.SESSION_KEY, data.session_uid);
      localStorage.setItem(this.LAST_VALIDATION_KEY, Date.now().toString());
    }
  }

  static getSession(): {
    user_id?: string;
    username?: string;
    session_uid?: string;
    access_token?: string;
  } | null {
    if (typeof window === 'undefined') return null;

    try {
      const user = localStorage.getItem(this.USER_KEY);
      const token = localStorage.getItem(this.TOKEN_KEY);
      const session = localStorage.getItem(this.SESSION_KEY);

      if (!user || !token) return null;

      return {
        ...JSON.parse(user),
        access_token: token,
        session_uid: session
      };
    } catch {
      return null;
    }
  }

  static clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.LAST_VALIDATION_KEY);
      // Also clear API mode to force redetection
      localStorage.removeItem('apiMode');
      localStorage.removeItem('detectedApiMode');
    }
  }

  static isLoggedIn(): boolean {
    const session = this.getSession();
    return !!(session?.access_token && session?.user_id);
  }

  /**
   * Validate session on startup and periodically
   * Automatically logs out if session is invalid
   */
  static async validateSession(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    // Prevent multiple concurrent validations
    if (this.validationPromise) {
      return this.validationPromise;
    }

    this.validationPromise = this._performValidation();
    const result = await this.validationPromise;
    this.validationPromise = null;
    
    return result;
  }

  private static async _performValidation(): Promise<boolean> {
    const session = this.getSession();
    if (!session?.access_token) {
      return false;
    }

    // Check if we need to validate (don't validate too frequently)
    const lastValidation = localStorage.getItem(this.LAST_VALIDATION_KEY);
    const now = Date.now();
    
    if (lastValidation && (now - parseInt(lastValidation)) < this.VALIDATION_INTERVAL) {
      return true; // Recently validated, assume still valid
    }

    try {
      console.log('Validating user session...');
      const { AuthService } = await import('@/lib/auth');
      const response = await AuthService.getCurrentUser();
      
      if (response.success) {
        // Update last validation time
        localStorage.setItem(this.LAST_VALIDATION_KEY, now.toString());
        console.log('Session validation successful');
        return true;
      } else {
        console.warn('Session validation failed:', response.error);
        this.clearSession();
        return false;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      // Don't clear session on network errors, but don't update validation time
      return false;
    }
  }

  /**
   * Should be called on app startup
   */
  static async initializeSession(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      return await this.validateSession();
    } catch (error) {
      console.error('Session initialization failed:', error);
      this.clearSession();
      return false;
    }
  }
}

// API Service Class
export class AuthService {
  private static async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AuthResponse> {
    try {
      const url = BackendConfig.buildURL(endpoint);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || 'Request failed',
          message: data.message || `HTTP ${response.status}`
        };
      }

      return {
        success: true,
        data,
        message: data.message || 'Success'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        message: 'Failed to connect to server'
      };
    }
  }

  static async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    return this.makeRequest(BackendConfig.registerEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
        // captcha_token: credentials.captchaToken // Add when backend supports it
      }),
    });
  }

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.makeRequest(BackendConfig.loginEndpoint, {
      method: 'POST',
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
        // captcha_token: credentials.captchaToken // Add when backend supports it
      }),
    });
  }

  static async logout(): Promise<AuthResponse> {
    const session = SessionManager.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'Not logged in' };
    }

    const result = await this.makeRequest(BackendConfig.logoutEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    // Clear session regardless of server response
    SessionManager.clearSession();
    return result;
  }

  static async getCurrentUser(): Promise<AuthResponse> {
    const session = SessionManager.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'Not logged in' };
    }

    return this.makeRequest(BackendConfig.meEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });
  }

  static async checkHealth(): Promise<AuthResponse> {
    return this.makeRequest(BackendConfig.healthEndpoint, {
      method: 'GET',
    });
  }
}

export default AuthService;