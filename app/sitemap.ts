import type { MetadataRoute } from 'next'

const base = 'https://velclaw.cfd'

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
    url: `${base}${path}`,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
