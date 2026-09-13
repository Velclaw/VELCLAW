import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'github.com', port: '', pathname: '/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/builder',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Permissions-Policy', value: 'clipboard-read=(self), clipboard-write=(self)' },
        ],
      },
      {
        source: '/builder/:path*',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Permissions-Policy', value: 'clipboard-read=(self), clipboard-write=(self)' },
        ],
      },
    ]
  },
  async redirects() {
    return [{ source: '/docs', destination: '/docs/', permanent: false }]
  },
  async rewrites() {
    return [
      { source: '/docs/', destination: 'https://docs.velclaw.ai/' },
      { source: '/docs/:path*', destination: 'https://docs.velclaw.ai/:path*' },
    ]
  },
}

export default nextConfig
