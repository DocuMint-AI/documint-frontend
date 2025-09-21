/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Proxy API requests to backend
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
    
    // If no backend URL is set, assume backend is on localhost:8000 (for local dev)
    // If backend URL is empty, we're running in container and backend is internal
    const shouldProxy = !backendUrl || backendUrl === '';
    
    if (!shouldProxy) {
      return [];
    }
    
    const targetUrl = backendUrl || 'http://localhost:8000';
    
    return [
      // API routes
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
      // Health check
      {
        source: '/health',
        destination: `${targetUrl}/health`,
      },
    ];
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