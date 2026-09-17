import { VELCLAW_PUBLIC_DOMAIN } from '@/lib/velclaw/domain-config'

/**
 * Public Velclaw hostname boundary.
 *
 * The hostname is deployment configuration, not application identity. This
 * keeps the runtime independent from the current temporary or future TLD.
 */
export { VELCLAW_PUBLIC_DOMAIN }

export function resolveVelclawVirtualDomain(hostname: string | null | undefined): string {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return normalized || VELCLAW_PUBLIC_DOMAIN
}

export function isVelclawPublicDomain(hostname: string | null | undefined): boolean {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return normalized === VELCLAW_PUBLIC_DOMAIN
}
