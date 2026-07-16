import type { NextConfig } from 'next';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tapback.co',
        pathname: '/api/avatar/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
      {
        // Reserved for real-time copy-job progress streaming.
        // The socket.io-client dep will be added when the client subscribes.
        source: '/socket.io/:path*',
        destination: `${API_URL}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
