import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getVelclawDomainRole, getVelclawOriginForRole } from '@/lib/velclaw/domain-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers()
  const role = getVelclawDomainRole(requestHeaders.get('host'))
  const origin = getVelclawOriginForRole(role)
  const pathsByRole = {
    platform: ['/', '/projects', '/deploy', '/operations', '/velclaw', '/tasks', '/plugins', '/skills'],
    developer: ['/', '/docs', '/builder', '/operations', '/mcp', '/api-keys', '/repos/new', '/velclaw'],
    application: ['/', '/console', '/projects', '/deploy', '/operations', '/velclaw', '/tasks'],
  } as const
  return pathsByRole[role].map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
