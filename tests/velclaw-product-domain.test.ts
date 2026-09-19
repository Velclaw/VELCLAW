import test from 'node:test'
import assert from 'node:assert/strict'
import {
  VELCLAW_PRODUCT_DOMAIN,
  VELCLAW_PRODUCT_URL,
  buildVelclawProductUrl,
  isVelclawProductUrl,
} from '../lib/velclaw/product-domain'

test('Velclaw product domain is canonical and HTTPS-only', () => {
  assert.equal(VELCLAW_PRODUCT_DOMAIN, 'velclaw.com')
  assert.equal(VELCLAW_PRODUCT_URL, 'https://velclaw.com')
  assert.equal(isVelclawProductUrl('https://velclaw.com'), true)
  assert.equal(isVelclawProductUrl('https://velclaw-git-main-velclaw.dev'), true)
  assert.equal(isVelclawProductUrl('http://velclaw.com'), false)
  assert.equal(isVelclawProductUrl('https://velclaw.vercel.app'), false)
  assert.equal(isVelclawProductUrl('https://example.com'), false)
})

test('branch deployment URLs stay inside the Velclaw namespace', () => {
  assert.equal(
    buildVelclawProductUrl('feat/velclaw-deploy-page3'),
    'https://velclaw-git-feat-velclaw-deploy-page3-velclaw.com',
  )
  assert.equal(buildVelclawProductUrl('main'), 'https://velclaw-git-main-velclaw.dev')
  assert.match(buildVelclawProductUrl('feature/with spaces'), /^https:\/\/velclaw-git-[a-z0-9-]+-velclaw\.cfd$/)
})
