import assert from 'node:assert/strict'
import test from 'node:test'
import { VELCLAW_INTEGRATIONS } from '../lib/velclaw/integrations'
import {
  VELCLAW_PUBLIC_DOMAIN,
  VELCLAW_VIRTUAL_DOMAIN,
  isVelclawPublicDomain,
  resolveVelclawVirtualDomain,
} from '../lib/velclaw/virtual-domain'

test('Velclaw virtual domain keeps huynhthuong.xyz as the public hostname', () => {
  assert.equal(VELCLAW_PUBLIC_DOMAIN, 'huynhthuong.xyz')
  assert.equal(VELCLAW_VIRTUAL_DOMAIN, 'velclaw.ai')
  assert.equal(resolveVelclawVirtualDomain('huynhthuong.xyz'), 'velclaw.ai')
  assert.equal(resolveVelclawVirtualDomain('huynhthuong.xyz:3000'), 'velclaw.ai')
  assert.equal(isVelclawPublicDomain('huynhthuong.xyz'), true)
  assert.equal(isVelclawPublicDomain('velclaw.ai'), false)
})

test('Velclaw registry contains only current useful ecosystem boundaries', () => {
  const ids = new Set(VELCLAW_INTEGRATIONS.map((integration) => integration.id))
  for (const id of [
    'github-cloud',
    'vercel-cloud',
    'mcp-runtime',
    'gito-review',
    'ollama-local',
    'git-worktree',
    'skills',
    'curl-network',
    'mdn-web-platform',
    'ibm-cloud',
  ]) {
    assert.ok(ids.has(id), `missing useful integration: ${id}`)
  }
  for (const id of ['gitlab-cloud', 'bitbucket-cloud', 'azure-devops', 'claude-skills', 'docs']) {
    assert.equal(ids.has(id), false, `unnecessary integration retained: ${id}`)
  }
  assert.equal(VELCLAW_INTEGRATIONS.find((integration) => integration.id === 'mcp-runtime')?.status, 'available')
})
