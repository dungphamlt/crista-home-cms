import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3002', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '**', pathname: '/**' },
    ],
  },
};

export default nextConfig;
