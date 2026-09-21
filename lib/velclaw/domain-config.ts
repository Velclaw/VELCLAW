function normalizeOrigin(value: string | undefined, fallback: string): string {
  const candidate = (value || fallback).trim().replace(/\/+$/, '')
  try {
    return new URL(candidate).origin
  } catch {
    throw new Error(`Invalid Velclaw origin: ${candidate}`)
  }
}

export const VELCLAW_DOMAIN_ROLES = {
  brand: 'https://velclaw.com',
  ai: 'https://velclaw.ai',
  dev: 'https://velclaw.dev',
  app: 'https://velclaw.app',
  io: 'https://velclaw.io',
} as const

export const VELCLAW_PUBLIC_ORIGIN = normalizeOrigin(process.env.VELCLAW_PUBLIC_ORIGIN, VELCLAW_DOMAIN_ROLES.brand)
export const VELCLAW_OAUTH_ISSUER = normalizeOrigin(process.env.VELCLAW_OAUTH_ISSUER, VELCLAW_DOMAIN_ROLES.app)
export const VELCLAW_APP_ORIGIN = normalizeOrigin(process.env.VELCLAW_APP_ORIGIN, VELCLAW_DOMAIN_ROLES.app)
export const VELCLAW_API_ORIGIN = normalizeOrigin(process.env.VELCLAW_API_ORIGIN, `${VELCLAW_DOMAIN_ROLES.io}`)
export const VELCLAW_DOCS_ORIGIN = normalizeOrigin(process.env.VELCLAW_DOCS_ORIGIN, VELCLAW_DOMAIN_ROLES.dev)
export const VELCLAW_PUBLIC_DOMAIN = new URL(VELCLAW_PUBLIC_ORIGIN).hostname

export const VELCLAW_ALLOWED_ORIGINS = (process.env.VELCLAW_ALLOWED_ORIGINS || Object.values(VELCLAW_DOMAIN_ROLES).join(','))
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => normalizeOrigin(value, VELCLAW_PUBLIC_ORIGIN))

export function getVelclawDomainConfig() {
  return {
    roles: VELCLAW_DOMAIN_ROLES,
    publicOrigin: VELCLAW_PUBLIC_ORIGIN,
    oauthIssuer: VELCLAW_OAUTH_ISSUER,
    appOrigin: VELCLAW_APP_ORIGIN,
    apiOrigin: VELCLAW_API_ORIGIN,
    docsOrigin: VELCLAW_DOCS_ORIGIN,
    publicDomain: VELCLAW_PUBLIC_DOMAIN,
    allowedOrigins: VELCLAW_ALLOWED_ORIGINS,
  }
}
