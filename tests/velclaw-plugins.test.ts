import test from 'node:test'
import assert from 'node:assert/strict'
import { VELCLAW_INTEGRATIONS } from '../lib/velclaw/integrations'

test('Velclaw Plugins registry has unique integration ids', () => {
  const ids = VELCLAW_INTEGRATIONS.map((integration) => integration.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('Velclaw Plugins registry exposes status and capabilities', () => {
  assert.ok(VELCLAW_INTEGRATIONS.length > 0)
  for (const integration of VELCLAW_INTEGRATIONS) {
    assert.ok(integration.name)
    assert.ok(integration.source)
    assert.ok(['planned', 'available'].includes(integration.status))
    assert.ok(Array.isArray(integration.capabilities))
  }
})

test('core plugin entries remain available for the current workflow', () => {
  const ids = new Set(VELCLAW_INTEGRATIONS.map((integration) => integration.id))
  for (const id of ['github-cloud', 'mcp-runtime', 'ollama-local', 'curl-network', 'mdn-web-platform']) {
    assert.equal(ids.has(id), true, `missing core integration: ${id}`)
  }
})
