import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/session'],
    },
    sitemap: 'https://velclaw.cfd/sitemap.xml',
    host: 'https://velclaw.cfd',
  }
}
