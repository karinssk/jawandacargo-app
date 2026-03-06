import type { NextConfig } from 'next';
import path from 'path';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:3101';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/line/:path*',
        destination: `${backendUrl}/line/:path*`,
      },
    ];
  },
};

export default nextConfig;
