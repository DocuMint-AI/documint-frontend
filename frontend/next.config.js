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
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
    
    return [
      // API routes
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      // Auth routes
      {
        source: '/register',
        destination: `${backendUrl}/register`,
      },
      {
        source: '/login',
        destination: `${backendUrl}/login`,
      },
      {
        source: '/logout',
        destination: `${backendUrl}/logout`,
      },
      {
        source: '/me',
        destination: `${backendUrl}/me`,
      },
      {
        source: '/update-password',
        destination: `${backendUrl}/update-password`,
      },
      // Health check
      {
        source: '/health',
        destination: `${backendUrl}/health`,
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