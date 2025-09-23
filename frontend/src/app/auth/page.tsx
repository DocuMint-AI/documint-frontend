'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { AuthService, SessionManager, LoginCredentials, RegisterCredentials } from '@/lib/auth';
import { MathCaptcha } from '@/components/MathCaptcha';
import AuthGuard from '@/components/AuthGuard';
import ThemeToggle from '@/components/ThemeToggle';

interface FormData {
  username: string;
  password: string;
  confirmPassword?: string;
}

interface FormErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
  captcha?: string;
  general?: string;
}

export default function AuthPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation (only for register)
    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // CAPTCHA validation
    if (!captchaToken) {
      newErrors.captcha = 'Please complete the CAPTCHA';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setErrors({});

    try {
      if (isLogin) {
        // Login
        const credentials: LoginCredentials = {
          username: formData.username.trim(),
          password: formData.password,
          captchaToken
        };

        const response = await AuthService.login(credentials);

        if (response.success && response.data) {
          // Save session
          SessionManager.saveSession({
            user_id: response.data.user_id,
            username: formData.username,
            session_uid: response.data.session_uid,
            access_token: response.data.access_token
          });

          setMessage({
            type: 'success',
            text: `Welcome back, ${formData.username}! Redirecting...`
          });

          // Redirect to upload page
          setTimeout(() => {
            router.push('/upload');
          }, 2000);
        } else {
          // Check if the error suggests user doesn't exist
          let errorMessage = response.error || 'Login failed';
          if (errorMessage.toLowerCase().includes('incorrect username') || 
              errorMessage.toLowerCase().includes('username or password') ||
              errorMessage.toLowerCase().includes('user not found')) {
            errorMessage = 'Username not found. Please check your username or create a new account.';
          }
          
          setMessage({
            type: 'error',
            text: errorMessage
          });
          // Reset CAPTCHA on login failure
          setCaptchaToken('');
        }
      } else {
        // Register
        const credentials: RegisterCredentials = {
          username: formData.username.trim(),
          password: formData.password,
          captchaToken
        };

        const response = await AuthService.register(credentials);

        if (response.success && response.data) {
          setMessage({
            type: 'success',
            text: `Account created successfully! You can now log in.`
          });
          
          // Switch to login form
          setIsLogin(true);
          setFormData({ username: formData.username, password: '', confirmPassword: '' });
        } else {
          setMessage({
            type: 'error',
            text: response.error || 'Registration failed'
          });
          // Reset CAPTCHA on registration failure
          setCaptchaToken('');
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.'
      });
      // Reset CAPTCHA only on error
      setCaptchaToken('');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Toggle between login and register
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', password: '', confirmPassword: '' });
    setErrors({});
    setMessage(null);
    // Keep CAPTCHA token when switching between login/register
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen blurry-section stars-bg bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4">
        {/* Animated background blobs */}
        <div className="multi-blob multi-blob-1"></div>
        <div className="multi-blob multi-blob-2"></div>
        <div className="multi-blob multi-blob-3"></div>
        
        {/* Theme toggle */}
        <div className="fixed top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
        <div className="panel-translucent rounded-xl p-8 panel-glow animate-fade-in">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {process.env.NEXT_PUBLIC_APP_NAME || 'DocuMint AI'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </p>
            <button
              type="button"
              onClick={toggleMode}
              disabled={isLoading}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 text-sm"
            >
              {isLogin ? "Need an account? Sign up" : 'Have an account? Sign in'}
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`rounded-lg p-3 mb-4 animate-slide-up text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                className="input-field"
                placeholder="Enter username"
                required
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className="input-field"
                placeholder="Enter password"
                required
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field (Register only) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="input-field"
                  placeholder="Confirm password"
                  required
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* CAPTCHA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Security Check
              </label>
              <MathCaptcha
                key={`auth-captcha-${isLogin}`} // Reset only when switching modes
                onVerify={(isValid, token) => {
                  if (isValid && token) {
                    setCaptchaToken(token);
                    if (errors.captcha) {
                      setErrors(prev => ({ ...prev, captcha: undefined }));
                    }
                  } else {
                    setCaptchaToken('');
                  }
                }}
                onExpire={() => setCaptchaToken('')}
                theme={isDarkMode ? "dark" : "light"}
                className="w-full"
                preventReset={true}
              />
              {errors.captcha && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.captcha}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !captchaToken}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900 ${
                captchaToken 
                  ? 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                  : 'text-white bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                captchaToken ? (isLogin ? 'Sign In' : 'Create Account') : (isLogin ? 'Solve CAPTCHA to Sign In' : 'Solve CAPTCHA to Create Account')
              )}
            </button>
          </form>
        </div>
      </div>
      </div>
    </AuthGuard>
  );
}