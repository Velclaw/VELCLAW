import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getVelclawDomainRole, getVelclawOriginForRole } from '@/lib/velclaw/domain-config'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers()
  const role = getVelclawDomainRole(requestHeaders.get('host'))
  const origin = getVelclawOriginForRole(role)

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/session'],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  }
}
