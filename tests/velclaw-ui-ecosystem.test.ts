import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { VELCLAW_INTEGRATIONS } from '../lib/velclaw/integrations'
import { VELCLAW_SKILLS } from '../lib/velclaw/skills'
import { buildVelclawProductUrl, isVelclawProductUrl, VELCLAW_PRODUCT_DOMAIN, VELCLAW_PRODUCT_URL } from '../lib/velclaw/product-domain'
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
  assert.equal(isVelclawPublicDomain('velclaw-git-main-velclaw.cfd'), true)
  assert.equal(isVelclawPublicDomain('velclaw-git-main-velclaw.vercel.app'), false)
})

test('Velclaw product URLs are first-party and branch-derived', () => {
  assert.equal(VELCLAW_PRODUCT_DOMAIN, 'velclaw.cfd')
  assert.equal(VELCLAW_PRODUCT_URL, 'https://velclaw.cfd')
  const url = buildVelclawProductUrl('feat/velclaw-deploy-page3')
  assert.equal(url, 'https://velclaw-git-feat-velclaw-deploy-page3-velclaw.cfd')
  assert.equal(isVelclawProductUrl(url), true)
  assert.equal(isVelclawProductUrl('https://velclaw-git-feat-velclaw-deploy-page3-velclaw.vercel.app'), false)
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

test('Velclaw Skills and Deploy are part of the canonical ecosystem contract', () => {
  assert.ok(VELCLAW_SKILLS.length > 0)
  assert.ok(VELCLAW_SKILLS.every((skill) => skill.id.startsWith('velclaw-')))
  assert.equal(VELCLAW_INTEGRATIONS.find((integration) => integration.id === 'skills')?.status, 'available')
  const deploymentSkill = VELCLAW_SKILLS.find((skill) => skill.id === 'velclaw-deployment')
  assert.equal(deploymentSkill?.name, 'Velclaw Deployment')
  assert.ok(deploymentSkill?.capabilities.includes('docker-build'))
  assert.ok(deploymentSkill?.capabilities.includes('container-runtime'))
})

test('Velclaw root Docker runtime is present and uses the production contract', () => {
  assert.equal(existsSync('Dockerfile'), true)
  const dockerfile = readFileSync('Dockerfile', 'utf8')
  assert.match(dockerfile, /FROM node:22-bookworm-slim/)
  assert.match(dockerfile, /pnpm install --frozen-lockfile/)
  assert.match(dockerfile, /pnpm build/)
  assert.match(dockerfile, /EXPOSE 3000/)
  assert.match(dockerfile, /USER velclaw/)
})
