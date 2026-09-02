export const VELCLAW_PUBLIC_DOMAIN = 'velclaw.cfd'

/**
 * Canonical Velclaw hostname boundary.
 *
 * velclaw.cfd is the only domain identity used by the application.
 */
export function resolveVelclawVirtualDomain(hostname: string | null | undefined): string {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return normalized || VELCLAW_PUBLIC_DOMAIN
}

export function isVelclawPublicDomain(hostname: string | null | undefined): boolean {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return normalized === VELCLAW_PUBLIC_DOMAIN
}
