import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:3000/socket.io/:path*',
      },
    ];
  },
};

export default nextConfig;
