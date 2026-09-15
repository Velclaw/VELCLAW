import type { MetadataRoute } from 'next'
import { VELCLAW_PUBLIC_ORIGIN } from '@/lib/velclaw/domain-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    '/',
    '/docs/',
    '/velclawhub',
    '/hub',
    '/deploy',
    '/deploy/engine',
    '/new',
    '/tasks',
    '/velclaw',
    '/skills',
    '/plugins',
    '/mcp',
    '/api-keys',
    '/repos/new',
    '/auth/signin',
    '/velclaw/ui-audit',
  ]

  return paths.map((path) => ({
    url: `${VELCLAW_PUBLIC_ORIGIN}${path}`,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
