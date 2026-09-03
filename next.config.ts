import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/docs/',
        destination: 'https://docs.velclaw.ai/',
      },
      {
        source: '/docs/:path*',
        destination: 'https://docs.velclaw.ai/:path*',
      },
    ]
  },
}

export default nextConfig
