import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { createRequire } from 'node:module'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import type { TestContext } from 'node:test'

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

function registryFixture(t: TestContext, definition: Record<string, unknown>) {
  const directory = mkdtempSync(path.join(tmpdir(), 'velclaw-registry-test-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const filename = path.join(directory, 'mcp.json')
  writeFileSync(filename, JSON.stringify({ mcpServers: { example: definition } }))
  return filename
}

test('substitution resolves repeated and adjacent placeholders across all supported fields', (t) => {
  const filename = registryFixture(t, {
    type: 'http',
    url: 'https://${HOST}/mcp/${VERSION}',
    args: ['--token=${TOKEN}', '${VERSION}${VERSION}', 'literal'],
    env: { CONNECTION: '${HOST}:${VERSION}', TOKEN: '${TOKEN}' },
    headers: { Authorization: 'Bearer ${TOKEN}', Repeated: '${TOKEN}/${TOKEN}' },
  })
  const [server] = loadMcpRegistry(filename, { HOST: 'example.test', VERSION: 'v1', TOKEN: 'synthetic-token' })
  assert.equal(server.url, 'https://example.test/mcp/v1')
  assert.deepEqual(server.args, ['--token=synthetic-token', 'v1v1', 'literal'])
  assert.deepEqual(server.env, { CONNECTION: 'example.test:v1', TOKEN: 'synthetic-token' })
  assert.deepEqual(server.headers, {
    Authorization: 'Bearer synthetic-token',
    Repeated: 'synthetic-token/synthetic-token',
  })
})

test('missing and empty substitutions disappear while falsy-looking strings survive', (t) => {
  const filename = registryFixture(t, {
    command: 'node',
    args: ['before${MISSING}after', '${EMPTY}', '${ZERO}', '${FALSE}'],
    env: { REQUIRED: '${MISSING}' },
    headers: { Required: '${EMPTY}' },
    url: '${MISSING}',
  })
  const values = { EMPTY: '', ZERO: '0', FALSE: 'false' }
  const [server] = loadMcpRegistry(filename, values)
  assert.deepEqual(server.args, ['beforeafter', '', '0', 'false'])
  assert.deepEqual(server.env, { REQUIRED: '' })
  assert.deepEqual(server.headers, { Required: '' })
  assert.equal(server.url, null)
  assert.equal(getMcpStatus(filename, values)[0].configured, false)
})

test('substitution accepts digits and underscores and leaves unsupported syntax unchanged', (t) => {
  const filename = registryFixture(t, {
    command: 'node',
    args: ['${API_KEY_2}', '${lowercase}', '$TOKEN', '${}', '${TOKEN:-default}'],
  })
  assert.deepEqual(loadMcpRegistry(filename, { API_KEY_2: 'value' })[0].args, [
    'value',
    '${lowercase}',
    '$TOKEN',
    '${}',
    '${TOKEN:-default}',
  ])
})

test('substitution preserves literal replacement characters and does not recursively expand values', (t) => {
  const filename = registryFixture(t, { command: 'node', args: ['${TOKEN}'] })
  assert.deepEqual(loadMcpRegistry(filename, { TOKEN: '$& $$ ${OTHER}', OTHER: 'hidden' })[0].args, ['$& $$ ${OTHER}'])
})

test('non-string arguments and environment values pass through unchanged', (t) => {
  const filename = registryFixture(t, { command: 'node', args: [0, false, null], env: { NUMBER: 42, FLAG: false } })
  const [server] = loadMcpRegistry(filename, {})
  assert.deepEqual(server.args, [0, false, null])
  assert.deepEqual(server.env, { NUMBER: 42, FLAG: false })
})

test('an explicit environment is isolated between loads and status omits substituted values', (t) => {
  const filename = registryFixture(t, { command: 'node', env: { TOKEN: '${TOKEN}' }, headers: { Key: '${TOKEN}' } })
  const values = Object.freeze({ TOKEN: 'synthetic-private-value' })
  assert.equal(loadMcpRegistry(filename, values)[0].env.TOKEN, 'synthetic-private-value')
  assert.equal(loadMcpRegistry(filename, {})[0].env.TOKEN, '')
  assert.deepEqual(getMcpStatus(filename, values), [
    {
      name: 'example',
      type: 'stdio',
      disabled: false,
      ready: true,
      configured: true,
    },
  ])
})
