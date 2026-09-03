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
  return `https://velclaw-git-${boundedBranch}-velclaw.${VELCLAW_PRODUCT_DOMAIN}`
}

export function isVelclawProductUrl(value: string | null | undefined): value is string {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (
      url.hostname === VELCLAW_PRODUCT_DOMAIN ||
      url.hostname.endsWith(`.${VELCLAW_PRODUCT_DOMAIN}`)
    )
  } catch {
    return false
  }
}
