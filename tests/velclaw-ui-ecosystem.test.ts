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

test('Velclaw integration registry exposes the expanded ecosystem boundaries', () => {
  const ids = new Set(VELCLAW_INTEGRATIONS.map((integration) => integration.id))

  for (const id of [
    'github-cloud',
    'vercel-cloud',
    'gitlab-cloud',
    'bitbucket-cloud',
    'azure-devops',
    'mcp-runtime',
    'curl-network',
    'mdn-web-platform',
    'ibm-cloud',
  ]) {
    assert.ok(ids.has(id), `missing integration: ${id}`)
  }

  assert.equal(VELCLAW_INTEGRATIONS.find((integration) => integration.id === 'github-cloud')?.status, 'available')
  assert.equal(VELCLAW_INTEGRATIONS.find((integration) => integration.id === 'gitlab-cloud')?.status, 'planned')
  assert.equal(VELCLAW_INTEGRATIONS.find((integration) => integration.id === 'azure-devops')?.status, 'planned')
})
