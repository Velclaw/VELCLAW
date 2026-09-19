import { VELCLAW_DOMAINS } from '@/lib/velclaw/product-domain'

export { VELCLAW_DOMAINS }

export const VELCLAW_PUBLIC_DOMAIN = VELCLAW_DOMAINS.brand
const FIRST_PARTY = /^(?:[a-z0-9-]+\.)*velclaw\.(?:com|ai|dev|app|io)$/i

export function resolveVelclawVirtualDomain(hostname: string | null | undefined): string {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return normalized || VELCLAW_PUBLIC_DOMAIN
}

export function isVelclawPublicDomain(hostname: string | null | undefined): boolean {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return FIRST_PARTY.test(normalized)
}
