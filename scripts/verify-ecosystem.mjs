import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const registry = join(root, 'docs/VELCLAW_ECOSYSTEM.md')
const context = join(root, 'docs/VELCLAW_CONTEXT.md')
const contract = join(root, 'docs/VELCLAW_ECOSYSTEM_CONTRACT.json')

const required = [registry, context, contract]
const missing = required.filter((file) => !existsSync(file))
if (missing.length) {
  console.error(`Missing ecosystem contract files: ${missing.join(', ')}`)
  process.exit(1)
}

const registryText = readFileSync(registry, 'utf8')
const contextText = readFileSync(context, 'utf8')
const contractData = JSON.parse(readFileSync(contract, 'utf8'))

const failures = []
const canonicalRepository = 'Velclaw/VELCLAW'

if (contractData.canonicalRepository !== canonicalRepository) {
  failures.push(`canonical repository mismatch: ${contractData.canonicalRepository}`)
}
if (contractData.canonicalBranch !== 'main') failures.push('canonical branch is not main')
if (!contextText.includes(`Canonical GitHub repository: **\`${canonicalRepository}\`**`)) {
  failures.push('project context does not identify the canonical repository')
}
if (!registryText.includes(canonicalRepository)) failures.push('ecosystem registry does not identify the core repository')
if (!Array.isArray(contractData.repositories) || contractData.repositories.length === 0) {
  failures.push('ecosystem repository contract is empty')
}
if (!Array.isArray(contractData.contracts) || !contractData.contracts.includes('github')) {
  failures.push('GitHub integration contract missing')
}
if (!Array.isArray(contractData.contracts) || !contractData.contracts.includes('http-api')) {
  failures.push('HTTP API integration contract missing')
}
if (!Array.isArray(contractData.contracts) || !contractData.contracts.includes('webhooks')) {
  failures.push('webhook integration contract missing')
}
if (!Array.isArray(contractData.contracts) || !contractData.contracts.includes('oauth')) {
  failures.push('OAuth integration contract missing')
}
if (!Array.isArray(contractData.contracts) || !contractData.contracts.includes('mcp-skills-plugins')) {
  failures.push('MCP/skills/plugins integration contract missing')
}

const staleCanonicalReferences = [
  'Velclaw/repo-Velclaw',
  'Velclaw/Velclaw',
]
for (const token of staleCanonicalReferences) {
  if (contextText.includes(token)) failures.push(`stale canonical reference in context: ${token}`)
  if (registryText.includes(token)) failures.push(`stale canonical reference in registry: ${token}`)
}

if (failures.length) {
  console.error('Velclaw ecosystem audit FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  `Velclaw ecosystem audit PASSED: canonical repository, branch, contracts, and ${contractData.repositories.length} registered repositories checked.`,
)
