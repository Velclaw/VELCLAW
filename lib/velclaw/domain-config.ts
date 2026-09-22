export type VelclawDomainRole = 'platform' | 'developer' | 'application'

export const VELCLAW_DOMAIN_ROLES = {
  platform: 'https://velclaw.site',
  developer: 'https://velclaw.dev',
  application: 'https://velclaw.app',
} as const

const DOMAIN_ROLE_BY_HOST: Record<string, VelclawDomainRole> = {
  'velclaw.site': 'platform',
  'www.velclaw.site': 'platform',
  'velclaw.dev': 'developer',
  'www.velclaw.dev': 'developer',
  'velclaw.app': 'application',
  'www.velclaw.app': 'application',
}

function normalizeOrigin(value: string | undefined, fallback: string): string {
  const candidate = (value || fallback).trim().replace(/\/+$/, '')
  try {
    return new URL(candidate).origin
  } catch {
    throw new Error(`Invalid Velclaw origin: ${candidate}`)
  }
}

export const VELCLAW_PUBLIC_ORIGIN = normalizeOrigin(process.env.VELCLAW_PUBLIC_ORIGIN, VELCLAW_DOMAIN_ROLES.platform)
export const VELCLAW_OAUTH_ISSUER = normalizeOrigin(process.env.VELCLAW_OAUTH_ISSUER, VELCLAW_DOMAIN_ROLES.platform)
export const VELCLAW_APP_ORIGIN = normalizeOrigin(process.env.VELCLAW_APP_ORIGIN, VELCLAW_DOMAIN_ROLES.application)
export const VELCLAW_API_ORIGIN = normalizeOrigin(process.env.VELCLAW_API_ORIGIN, VELCLAW_DOMAIN_ROLES.developer)
export const VELCLAW_DOCS_ORIGIN = normalizeOrigin(process.env.VELCLAW_DOCS_ORIGIN, VELCLAW_DOMAIN_ROLES.developer)
export const VELCLAW_PUBLIC_DOMAIN = new URL(VELCLAW_PUBLIC_ORIGIN).hostname

export const VELCLAW_ALLOWED_ORIGINS = (
  process.env.VELCLAW_ALLOWED_ORIGINS || Object.values(VELCLAW_DOMAIN_ROLES).join(',')
)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => normalizeOrigin(value, VELCLAW_PUBLIC_ORIGIN))

export const VELCLAW_DOMAIN_ROLE_CONTENT = {
  platform: {
    name: 'Velclaw AI',
    title: 'Velclaw AI — AI-native Software Platform',
    description: 'Velclaw.ai is the main AI-native software platform for agents, code, builds, runtime, review and delivery.',
    heading: 'Main AI-native software platform',
    intro: 'The main Velclaw.ai platform for the company, product ecosystem, workspace and production delivery.',
  },
  developer: {
    name: 'Velclaw Developer',
    title: 'Velclaw Dev — Developer Platform, IDE, Docs & API',
    description: 'Velclaw.dev is the developer surface for the Velclaw IDE, documentation, SDKs, APIs and engineering tools.',
    heading: 'Developer platform, IDE and API',
    intro: 'Build with Velclaw through the developer workspace, IDE, documentation, APIs, SDKs and engineering tools.',
  },
  application: {
    name: 'Velclaw App',
    title: 'Velclaw App — AI Software Workspace',
    description: 'Velclaw.app is the application surface for the Velclaw workspace, projects, deployments and user services.',
    heading: 'Velclaw applications and services',
    intro: 'Access the Velclaw application experience for workspaces, projects, deployments and user-facing services.',
  },
} as const

/** Maps a hostname, with or without a port, to a role and defaults unknown hosts to the platform role. */
export function getVelclawDomainRole(hostname: string | null | undefined): VelclawDomainRole {
  return DOMAIN_ROLE_BY_HOST[(hostname || '').toLowerCase().split(':')[0]] || 'platform'
}

/** Returns the canonical public origin assigned to a Velclaw domain role. */
export function getVelclawOriginForRole(role: VelclawDomainRole): string {
  return VELCLAW_DOMAIN_ROLES[role]
}

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
