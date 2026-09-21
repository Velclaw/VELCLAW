import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const registry = join(root, 'docs/VELCLAW_ECOSYSTEM.md')
const context = join(root, 'docs/VELCLAW_CONTEXT.md')

const required = [registry, context]
const missing = required.filter((file) => !existsSync(file))
if (missing.length) {
  console.error(`Missing ecosystem contract files: ${missing.join(', ')}`)
  process.exit(1)
}

const registryText = readFileSync(registry, 'utf8')
const contextText = readFileSync(context, 'utf8')

const requiredRepos = [
  'Velclaw/VELCLAW',
  'Velclaw/Oauth',
  'Velclaw/docs.velclaw.ai',
  'zskbot/repo-docs-velclaw',
  'zskbot/Autoship',
  'zskbot/autoship-velclaw',
  'Velclaw/deploy-velclaw',
  'zskbot/AgentsIDE',
  'zskbot/Zvelclaw',
  'zskbot/Zvelclaw-CLI',
  'zskbot/velclaw-pages',
  'zskbot/velclaw-browser',
  'Velclaw/zvelclaw-agent',
  'Velclaw/velclaw-eve',
  'zskbot/ZsKai',
  'zskbot/agent-skills',
  'zskbot/ChatGPT-CodeReview',
]

const failures = []
if (!contextText.includes('Current canonical GitHub repository: **`Velclaw/VELCLAW`**')) {
  failures.push('canonical repository is not Velclaw/VELCLAW')
}
if (!registryText.includes('Velclaw/VELCLAW')) {
  failures.push('ecosystem registry does not identify the core repository')
}
for (const repo of requiredRepos) {
  if (!registryText.includes(repo)) failures.push(`registry missing ${repo}`)
}
if (!contextText.includes('velclaw.com')) failures.push('canonical domain missing')
if (!registryText.includes('HTTP APIs')) failures.push('HTTP API contract missing')
if (!registryText.includes('Webhooks')) failures.push('webhook contract missing')
if (!registryText.includes('OAuth')) failures.push('OAuth contract missing')
if (!registryText.includes('MCP / skills / plugins')) failures.push('capability contract missing')

const stale = ['Velclaw/Velclaw', 'Velclaw/repo-Velclaw']
for (const token of stale) {
  if (contextText.includes(token)) failures.push(`stale canonical reference: ${token}`)
}

if (failures.length) {
  console.error('Velclaw ecosystem audit FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`Velclaw ecosystem audit PASSED: ${requiredRepos.length} registered integration repositories/contracts checked.`)
