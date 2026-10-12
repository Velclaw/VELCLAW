import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const contract = JSON.parse(readFileSync(join(root, 'docs/VELCLAW_ECOSYSTEM_CONTRACT.json'), 'utf8'))
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN

if (!token) {
  console.error('Live ecosystem audit requires GH_TOKEN or GITHUB_TOKEN')
  process.exit(1)
}

const failures = []
const warnings = []
if (contract.canonicalRepository !== 'Velclaw/VELCLAW') failures.push('canonical repository mismatch')
if (contract.canonicalDomain !== 'velclaw.cfd') failures.push('canonical domain mismatch')

for (const item of contract.repositories) {
  const response = await fetch(`https://api.github.com/repos/${item.repository}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!response.ok) {
    // GitHub intentionally returns 404 for private repositories that the built-in
    // workflow token cannot access. Do not misreport those as deleted repositories.
    if (response.status === 404 && item.repository !== contract.canonicalRepository) {
      warnings.push(`${item.repository}: not visible to this workflow token (private or unavailable)`)
    } else {
      failures.push(`${item.repository}: GitHub API ${response.status}`)
    }
    continue
  }
  const repo = await response.json()
  if (repo.default_branch !== 'main' && item.repository !== 'Velclaw/agent-zero') {
    failures.push(`${item.repository}: unexpected default branch ${repo.default_branch}`)
  }
  if (repo.archived) failures.push(`${item.repository}: archived`)
}

for (const warning of warnings) console.warn(`WARN: ${warning}`)
if (failures.length) {
  console.error('Velclaw live ecosystem audit FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Velclaw live ecosystem audit PASSED: canonical identity verified; ${warnings.length} repository visibility warning(s).`)
