import assert from 'node:assert/strict'
import test from 'node:test'
import { isVelclawPublicDomain } from '../lib/velclaw/virtual-domain'

for (const hostname of [
  'velclaw.site',
  'velclaw.dev',
  'velclaw.app',
  'www.velclaw.site',
  'api.velclaw.dev',
  'preview.team.velclaw.app',
  'velclaw-git-feature-login-velclaw.dev',
  ' VELCLAW.DEV:8443 ',
  'API.VELCLAW.APP:443',
]) {
  test(`public domain recognition accepts ${hostname}`, () => {
    assert.equal(isVelclawPublicDomain(hostname), true)
  })
}

for (const hostname of [
  null,
  undefined,
  '',
  '   ',
  'localhost:3000',
  'velclaw.cfd',
  'preview.velclaw.cfd',
  'velclaw-git-main-velclaw.cfd',
  'velclaw.vercel.app',
  'velclaw.site.attacker.test',
  'velclaw.dev.attacker.test',
  'velclaw.app.attacker.test',
  'fakevelclaw.site',
  'velclaw-site',
  'velclaw.site@attacker.test',
  'https://velclaw.site',
  'velclaw.dev:invalid',
]) {
  test(`public domain recognition rejects ${JSON.stringify(hostname)}`, () => {
    assert.equal(isVelclawPublicDomain(hostname), false)
  })
}
