import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
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
        destination: 'http://backend:5000/api/:path*',
      },
      {
        source: '/login',
        destination: 'http://backend:5000/login',
      },
      {
        source: '/register',
        destination: 'http://backend:5000/register',
      },
      {
        source: '/logout',
        destination: 'http://backend:5000/logout',
      },
      {
        source: '/user',
        destination: 'http://backend:5000/user',
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
