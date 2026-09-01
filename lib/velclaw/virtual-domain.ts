export const VELCLAW_PUBLIC_DOMAIN = 'huynhthuong.xyz'
export const VELCLAW_VIRTUAL_DOMAIN = 'velclaw.ai'

/**
 * Internal domain identity layer.
 *
 * The browser continues to use the real public hostname until velclaw.ai is
 * actually registered. The virtual domain is an identity/alias only and must
 * never be presented as an active DNS hostname before it is configured.
 */
export const VELCLAW_DOMAIN_ALIASES: Record<string, string> = {
  [VELCLAW_PUBLIC_DOMAIN]: VELCLAW_VIRTUAL_DOMAIN,
}

export function resolveVelclawVirtualDomain(hostname: string | null | undefined): string {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return VELCLAW_DOMAIN_ALIASES[normalized] || normalized || VELCLAW_VIRTUAL_DOMAIN
}

export function isVelclawPublicDomain(hostname: string | null | undefined): boolean {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return normalized === VELCLAW_PUBLIC_DOMAIN
}
