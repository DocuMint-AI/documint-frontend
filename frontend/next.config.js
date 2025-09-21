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
    // Always enable rewrites for containerized deployment
    // This ensures all API calls go through Next.js proxy
    return [
      // API routes
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      // Auth routes
      {
        source: '/register',
        destination: 'http://localhost:8000/register',
      },
      {
        source: '/login',
        destination: 'http://localhost:8000/login',
      },
      {
        source: '/logout',
        destination: 'http://localhost:8000/logout',
      },
      {
        source: '/me',
        destination: 'http://localhost:8000/me',
      },
      {
        source: '/update-password',
        destination: 'http://localhost:8000/update-password',
      },
      // Health check
      {
        source: '/health',
        destination: 'http://localhost:8000/health',
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