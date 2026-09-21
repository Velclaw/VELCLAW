import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { loadMcpRegistry, getMcpStatus } = require('../server/mcp-registry') as {
  loadMcpRegistry: (config: string, env: Record<string, string>) => Array<any>
  getMcpStatus: (config: string, env: Record<string, string>) => Array<any>
}

const config = path.join(process.cwd(), 'config', 'mcp.json')
const env = {
  POSTGRES_URL: 'postgres://example',
  GITHUB_MCP_PAT: 'github-token',
  CONTEXT7_API_KEY: 'context7-key',
  RECALL_PRIVATE_KEY: 'recall-key',
  RECALL_NETWORK: 'testnet',
  RECALL_BUCKET_ALIAS: 'sequential-thinking-logs',
  RECALL_LOG_PREFIX: 'sequential-',
}

test('loads the MCP registry and resolves environment placeholders', () => {
  const servers = loadMcpRegistry(config, env)
  assert.equal(servers.length, 6)
  assert.equal(servers.find((x) => x.name === 'postgres').args[1], '--access-mode=restricted')
  assert.equal(servers.find((x) => x.name === 'github').headers.Authorization, 'Bearer github-token')
  assert.equal(servers.find((x) => x.name === 'sequential-thinking-recall').disabled, true)
})

test('reports runtime readiness without exposing secrets', () => {
  const status = getMcpStatus(config, env)
  assert.equal(status.find((x) => x.name === 'playwright').ready, true)
  assert.equal(status.find((x) => x.name === 'sequential-thinking-recall').disabled, true)
  assert.equal(status.find((x) => x.name === 'postgres').configured, true)
})
