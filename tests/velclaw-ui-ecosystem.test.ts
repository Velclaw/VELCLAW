import assert from 'node:assert/strict'
import test from 'node:test'
import { VELCLAW_INTEGRATIONS } from '../lib/velclaw/integrations'
import { VELCLAW_SKILLS } from '../lib/velclaw/skills'
import {
  VELCLAW_PUBLIC_DOMAIN,
  isVelclawPublicDomain,
  resolveVelclawVirtualDomain,
} from '../lib/velclaw/virtual-domain'

test('Velclaw uses velclaw.cfd as the sole canonical hostname', () => {
  assert.equal(VELCLAW_PUBLIC_DOMAIN, 'velclaw.cfd')
  assert.equal(resolveVelclawVirtualDomain('velclaw.cfd'), 'velclaw.cfd')
  assert.equal(resolveVelclawVirtualDomain('velclaw.cfd:3000'), 'velclaw.cfd')
  assert.equal(isVelclawPublicDomain('velclaw.cfd'), true)
})

test('Velclaw registry contains only current useful ecosystem boundaries', () => {
  const ids = new Set(VELCLAW_INTEGRATIONS.map((integration) => integration.id))
  for (const id of ['github-cloud', 'vercel-cloud', 'mcp-runtime', 'gito-review', 'ollama-local', 'git-worktree', 'skills', 'curl-network', 'mdn-web-platform', 'ibm-cloud']) {
    assert.ok(ids.has(id), `missing useful integration: ${id}`)
  }
  for (const id of ['gitlab-cloud', 'bitbucket-cloud', 'azure-devops', 'claude-skills', 'docs']) {
    assert.equal(ids.has(id), false, `unnecessary integration retained: ${id}`)
  }
  assert.equal(VELCLAW_INTEGRATIONS.find((integration) => integration.id === 'mcp-runtime')?.status, 'available')
})

test('Velclaw Skills and Deploy are part of the canonical ecosystem contract', () => {
  assert.ok(VELCLAW_SKILLS.length > 0)
  assert.ok(VELCLAW_SKILLS.every((skill) => skill.id.startsWith('velclaw-')))
  assert.equal(VELCLAW_INTEGRATIONS.find((integration) => integration.id === 'skills')?.status, 'available')
  assert.equal(VELCLAW_SKILLS.find((skill) => skill.id === 'velclaw-deployment')?.name, 'Velclaw Deployment')
})
