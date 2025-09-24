/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Enable experimental features for better file upload handling
  experimental: {
    // Increase body size limit for file uploads
    isrMemoryCacheSize: 0,
  },
  // Proxy API requests to backend
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Always enable rewrites in production or when baseURL is empty/undefined
    const shouldProxy = isProduction || !backendUrl || backendUrl === '';
    
    console.log(`[Next.js Rewrites] backendUrl: "${backendUrl}", isProduction: ${isProduction}, shouldProxy: ${shouldProxy}`);
    
    if (!shouldProxy) {
      // For local development with explicit backend URL, don't use rewrites
      console.log('[Next.js Rewrites] Skipping rewrites - using direct API calls');
      return [];
    }
    
    // For production/container deployment, proxy to internal backend on port 8000
    const targetUrl = 'http://localhost:8000';
    console.log(`[Next.js Rewrites] Enabling rewrites to: ${targetUrl}`);
    
  const rules = [
      // API routes (including upload)
      {
        source: '/api/v1/upload',
        destination: `${targetUrl}/api/v1/upload`,
      },
      {
        source: '/api/:path*',
        destination: `${targetUrl}/api/:path*`,
      },
      // Auth routes
      {
        source: '/register',
        destination: `${targetUrl}/register`,
      },
      {
        source: '/login',
        destination: `${targetUrl}/login`,
      },
      {
        source: '/logout',
        destination: `${targetUrl}/logout`,
      },
      {
        source: '/me',
        destination: `${targetUrl}/me`,
      },
      {
        source: '/update-password',
        destination: `${targetUrl}/update-password`,
      },
    ];
    // Do not rewrite /health; handled by Next API route
    return rules;
  },
  webpack: (config, { isServer }) => {
    // Handle PDF.js on server side
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }
    
    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist/build/pdf.worker.js': 'pdfjs-dist/build/pdf.worker.min.js',
    };
    
    return config;
  },
}

module.exports = nextConfig