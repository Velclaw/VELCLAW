import type { MetadataRoute } from 'next'
import { VELCLAW_PUBLIC_ORIGIN } from '@/lib/velclaw/domain-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/session'],
    },
    sitemap: `${VELCLAW_PUBLIC_ORIGIN}/sitemap.xml`,
    host: VELCLAW_PUBLIC_ORIGIN,
  }
}
