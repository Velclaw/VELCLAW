import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getVelclawDomainRole, getVelclawOriginForRole } from '@/lib/velclaw/domain-config'

/** Returns the request domain's role-specific sitemap entries. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers()
  const role = getVelclawDomainRole(requestHeaders.get('host'))
  const origin = getVelclawOriginForRole(role)

  const pathsByRole = {
    platform: ['/', '/projects', '/deploy', '/velclaw', '/tasks', '/plugins', '/skills'],
    developer: ['/', '/docs', '/builder', '/mcp', '/api-keys', '/repos/new', '/velclaw'],
    application: ['/', '/console', '/projects', '/deploy', '/velclaw', '/tasks'],
  } as const

  return pathsByRole[role].map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
