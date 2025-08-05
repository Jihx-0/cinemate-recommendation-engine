import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
      {
        source: '/login',
        destination: 'http://localhost:5001/login',
      },
      {
        source: '/register',
        destination: 'http://localhost:5001/register',
      },
      {
        source: '/logout',
        destination: 'http://localhost:5001/logout',
      },
      {
        source: '/user',
        destination: 'http://localhost:5001/user',
      },
    ];
  },
  // Disable development tools
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
};

export default nextConfig;
