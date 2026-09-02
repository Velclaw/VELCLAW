export const VELCLAW_PUBLIC_DOMAIN = 'velclaw.cfd'

/**
 * Canonical Velclaw domain identity layer.
 *
 * velclaw.cfd is the only configured public/canonical hostname. The resolver
 * is retained as a small compatibility boundary for existing callers.
 */
export const VELCLAW_VIRTUAL_DOMAIN = VELCLAW_PUBLIC_DOMAIN
export const VELCLAW_DOMAIN_ALIASES: Record<string, string> = {
  [VELCLAW_PUBLIC_DOMAIN]: VELCLAW_PUBLIC_DOMAIN,
}

export function resolveVelclawVirtualDomain(hostname: string | null | undefined): string {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return VELCLAW_DOMAIN_ALIASES[normalized] || normalized || VELCLAW_PUBLIC_DOMAIN
}

export function isVelclawPublicDomain(hostname: string | null | undefined): boolean {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return normalized === VELCLAW_PUBLIC_DOMAIN
}
