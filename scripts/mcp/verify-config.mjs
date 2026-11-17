#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const configPath = resolve(root, 'config/mcp.json')
const rootConfigPath = resolve(root, '.mcp.json')
const config = JSON.parse(readFileSync(configPath, 'utf8'))
const rootConfig = JSON.parse(readFileSync(rootConfigPath, 'utf8'))

const servers = config.mcpServers ?? {}
const required = ['playwright', 'filesystem', 'postgres', 'github', 'context7', 'sequential-thinking-recall']
const missing = required.filter((name) => !Object.hasOwn(servers, name))

if (missing.length) {
  console.error(`MCP registry is missing required servers: ${missing.join(', ')}`)
  process.exit(1)
}

if (rootConfig.mcpServers !== 'config/mcp.json') {
  console.error('Root .mcp.json must point to config/mcp.json')
  process.exit(1)
}

const postgresArgs = servers.postgres.args ?? []
if (!postgresArgs.includes('--access-mode=restricted')) {
  console.error('Postgres MCP must remain in restricted access mode')
  process.exit(1)
}

const github = servers.github
if (github?.type !== 'http' || !String(github.url ?? '').startsWith('https://')) {
  console.error('GitHub MCP must use its HTTPS hosted endpoint')
  process.exit(1)
}

const recall = servers['sequential-thinking-recall']
if (recall?.disabled !== true) {
  console.error('Sequential Thinking Recall must stay disabled until explicitly provisioned')
  process.exit(1)
}

const serialized = JSON.stringify(config)
if (/(ghp_|github_pat_|sk-[A-Za-z0-9]|BEGIN (RSA|OPENSSH) PRIVATE KEY)/.test(serialized)) {
  console.error('MCP registry appears to contain a literal credential')
  process.exit(1)
}

console.log(`MCP registry valid: ${Object.keys(servers).length} servers; restricted Postgres; Recall disabled`)
