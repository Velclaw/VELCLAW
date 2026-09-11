export const VELCLAW_PRODUCT_DOMAIN = 'velclaw.cfd'
export const VELCLAW_PRODUCT_URL = `https://${VELCLAW_PRODUCT_DOMAIN}`

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Build the first-party public URL for a branch deployment.
 * Example: feat/velclaw-deploy-page3 ->
 * https://velclaw-git-feat-velclaw-deploy-page3-velclaw.cfd
 */
export function buildVelclawProductUrl(branchName: string): string {
  const branchSlug = slugify(branchName) || 'main'
  const availableBranchLength = 63 - 'velclaw-git-'.length - '-velclaw'.length
  const boundedBranch = branchSlug.slice(0, availableBranchLength).replace(/-+$/g, '') || 'main'
  return `https://velclaw-git-${boundedBranch}-velclaw.cfd`
}

export function isVelclawProductUrl(value: string | null | undefined): value is string {
  if (!value) return false
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    if (url.hostname === VELCLAW_PRODUCT_DOMAIN) return true
    return /^velclaw-git-[a-z0-9-]+-velclaw\.cfd$/.test(url.hostname)
  } catch {
    return false
  }
}
