export const VELCLAW_PRODUCT_DOMAIN = 'velclaw.site'
export const VELCLAW_PRODUCT_URL = 'https://velclaw.site'

const FIRST_PARTY_HOST = /^(?:[a-z0-9-]+\.)*velclaw\.(?:site|dev|app)$/i
const BRANCH_HOST = /^velclaw-git-[a-z0-9-]+-velclaw\.dev$/i

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function buildVelclawProductUrl(branchName: string): string {
  const branchSlug = slugify(branchName) || 'main'
  const prefix = 'velclaw-git-'
  const suffix = '-velclaw.dev'
  const availableBranchLength = 253 - prefix.length - suffix.length
  const boundedBranch = branchSlug.slice(0, availableBranchLength).replace(/-+$/g, '') || 'main'
  return `https://${prefix}${boundedBranch}${suffix}`
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
