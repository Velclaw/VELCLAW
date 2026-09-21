export const VELCLAW_DOMAINS = {
  brand: 'velclaw.com',
  ai: 'velclaw.ai',
  dev: 'velclaw.dev',
  app: 'velclaw.app',
  io: 'velclaw.io',
} as const

export const VELCLAW_PRODUCT_DOMAIN = VELCLAW_DOMAINS.brand
export const VELCLAW_PRODUCT_URL = `https://${VELCLAW_PRODUCT_DOMAIN}`

const FIRST_PARTY_HOST = /^(?:[a-z0-9-]+\.)*velclaw\.(?:com|ai|dev|app|io)$/i
const BRANCH_HOST = /^velclaw-git-[a-z0-9-]+-velclaw\.(?:com|dev|app)$/i

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function buildVelclawProductUrl(branchName: string, domain: keyof typeof VELCLAW_DOMAINS = 'dev'): string {
  const branchSlug = slugify(branchName) || 'main'
  const availableBranchLength = 63 - 'velclaw-git-'.length - '-velclaw'.length
  const boundedBranch = branchSlug.slice(0, availableBranchLength).replace(/-+$/g, '') || 'main'
  const tld = VELCLAW_DOMAINS[domain].split('.').pop()!
  return `https://velclaw-git-${boundedBranch}-velclaw.${tld}`
}

export function isVelclawProductUrl(value: string | null | undefined): value is string {
  if (!value) return false
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    return FIRST_PARTY_HOST.test(url.hostname) || BRANCH_HOST.test(url.hostname)
  } catch {
    return false
  }
}

export function isVelclawHostname(value: string | null | undefined): boolean {
  return Boolean(value && FIRST_PARTY_HOST.test(value.trim().toLowerCase()))
}
