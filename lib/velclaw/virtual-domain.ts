import { isVelclawProductUrl, VELCLAW_PRODUCT_DOMAIN } from '@/lib/velclaw/product-domain'

export const VELCLAW_PUBLIC_DOMAIN = VELCLAW_PRODUCT_DOMAIN
export function resolveVelclawVirtualDomain(hostname: string | null | undefined): string {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return normalized || VELCLAW_PUBLIC_DOMAIN
}

export function isVelclawPublicDomain(hostname: string | null | undefined): boolean {
  const normalized = (hostname || '').trim().toLowerCase().replace(/:\d+$/, '')
  return isVelclawProductUrl(`https://${normalized}`)
}
