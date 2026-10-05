import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createVelclawDomainConfig,
  getVelclawDomainConfig,
  getVelclawDomainRole,
  getVelclawOriginForRole,
  VELCLAW_DOMAIN_ROLE_CONTENT,
  VELCLAW_DOMAIN_ROLES,
  VELCLAW_PUBLIC_DOMAIN,
} from '../lib/velclaw/domain-config'

test('domain configuration defaults each surface to its designated first-party origin', () => {
  const config = createVelclawDomainConfig()

  assert.deepEqual(VELCLAW_DOMAIN_ROLES, {
    platform: 'https://velclaw.site',
    developer: 'https://velclaw.dev',
    application: 'https://velclaw.app',
  })
  assert.equal(config.publicOrigin, VELCLAW_DOMAIN_ROLES.platform)
  assert.equal(config.oauthIssuer, VELCLAW_DOMAIN_ROLES.platform)
  assert.equal(config.appOrigin, VELCLAW_DOMAIN_ROLES.application)
  assert.equal(config.apiOrigin, VELCLAW_DOMAIN_ROLES.developer)
  assert.equal(config.docsOrigin, VELCLAW_DOMAIN_ROLES.developer)
  assert.equal(config.publicDomain, 'velclaw.site')
  assert.equal(VELCLAW_PUBLIC_DOMAIN, 'velclaw.site')
  assert.deepEqual(config.allowedOrigins, Object.values(VELCLAW_DOMAIN_ROLES))
})

test('configured origins are trimmed and reduced to scheme, host, and port', () => {
  const config = createVelclawDomainConfig({
    VELCLAW_PUBLIC_ORIGIN: ' https://console.example.test/products/ ',
    VELCLAW_OAUTH_ISSUER: 'https://identity.example.test/oauth',
    VELCLAW_APP_ORIGIN: 'http://app.example.test:4100/workspace/',
    VELCLAW_API_ORIGIN: 'https://api.example.test/v1?source=config',
    VELCLAW_DOCS_ORIGIN: 'https://docs.example.test/reference#start',
    VELCLAW_ALLOWED_ORIGINS:
      ' https://one.example.test/path, ,http://two.example.test:8080/callback,https://one.example.test/other ',
  })

  assert.equal(config.publicOrigin, 'https://console.example.test')
  assert.equal(config.oauthIssuer, 'https://identity.example.test')
  assert.equal(config.appOrigin, 'http://app.example.test:4100')
  assert.equal(config.apiOrigin, 'https://api.example.test')
  assert.equal(config.docsOrigin, 'https://docs.example.test')
  assert.equal(config.publicDomain, 'console.example.test')
  assert.deepEqual(config.allowedOrigins, [
    'https://one.example.test',
    'http://two.example.test:8080',
    'https://one.example.test',
  ])
})

test('invalid configured origins fail fast', () => {
  assert.throws(
    () => createVelclawDomainConfig({ VELCLAW_PUBLIC_ORIGIN: 'not an origin' }),
    /Invalid Velclaw origin: not an origin/,
  )
  assert.throws(
    () => createVelclawDomainConfig({ VELCLAW_ALLOWED_ORIGINS: 'https://velclaw.site,not an origin' }),
    /Invalid Velclaw origin: not an origin/,
  )
})

test('known bare, www, case-insensitive, and port-qualified hosts resolve to their roles', () => {
  const cases = [
    ['velclaw.site', 'platform'],
    ['www.velclaw.site', 'platform'],
    ['VELCLAW.SITE', 'platform'],
    ['velclaw.site:3000', 'platform'],
    ['velclaw.dev', 'developer'],
    ['www.velclaw.dev', 'developer'],
    ['VELCLAW.DEV:443', 'developer'],
    ['velclaw.app', 'application'],
    ['www.velclaw.app', 'application'],
    ['VELCLAW.APP:8443', 'application'],
  ] as const

  for (const [hostname, expectedRole] of cases) {
    assert.equal(getVelclawDomainRole(hostname), expectedRole, hostname)
  }
})

test('missing, unknown, and lookalike hosts safely use the platform role', () => {
  for (const hostname of [
    undefined,
    null,
    '',
    'localhost',
    'preview.velclaw.dev',
    'velclaw.dev.example.com',
    'velclaw.app.attacker.test',
  ]) {
    assert.equal(getVelclawDomainRole(hostname), 'platform', String(hostname))
  }
})

test('role origins, content, and aggregate configuration remain aligned', () => {
  const roles = ['platform', 'developer', 'application'] as const
  const aggregate = getVelclawDomainConfig()

  assert.deepEqual(Object.keys(VELCLAW_DOMAIN_ROLE_CONTENT), roles)
  for (const role of roles) {
    const content = VELCLAW_DOMAIN_ROLE_CONTENT[role]
    assert.equal(getVelclawOriginForRole(role), VELCLAW_DOMAIN_ROLES[role])
    assert.ok(content.name.length > 0)
    assert.ok(content.title.length > 0)
    assert.ok(content.description.length > 0)
    assert.ok(content.heading.length > 0)
    assert.ok(content.intro.length > 0)
  }

  assert.deepEqual(aggregate, {
    roles: VELCLAW_DOMAIN_ROLES,
    publicOrigin: VELCLAW_DOMAIN_ROLES.platform,
    oauthIssuer: VELCLAW_DOMAIN_ROLES.platform,
    appOrigin: VELCLAW_DOMAIN_ROLES.application,
    apiOrigin: VELCLAW_DOMAIN_ROLES.developer,
    docsOrigin: VELCLAW_DOMAIN_ROLES.developer,
    publicDomain: VELCLAW_PUBLIC_DOMAIN,
    allowedOrigins: Object.values(VELCLAW_DOMAIN_ROLES),
  })
})

const ENVIRONMENT_KEYS = [
  'VELCLAW_PUBLIC_ORIGIN',
  'VELCLAW_OAUTH_ISSUER',
  'VELCLAW_APP_ORIGIN',
  'VELCLAW_API_ORIGIN',
  'VELCLAW_DOCS_ORIGIN',
  'VELCLAW_ALLOWED_ORIGINS',
] as const

const defaultOrigins = ['https://velclaw.site', 'https://velclaw.dev', 'https://velclaw.app']

test('an explicit empty environment returns the complete default configuration', () => {
  assert.deepEqual(createVelclawDomainConfig({}), {
    publicOrigin: 'https://velclaw.site',
    oauthIssuer: 'https://velclaw.site',
    appOrigin: 'https://velclaw.app',
    apiOrigin: 'https://velclaw.dev',
    docsOrigin: 'https://velclaw.dev',
    publicDomain: 'velclaw.site',
    allowedOrigins: defaultOrigins,
  })
})

test('empty or undefined environment values use defaults', () => {
  for (const value of ['', undefined]) {
    const env = Object.fromEntries(ENVIRONMENT_KEYS.map((key) => [key, value]))
    assert.deepEqual(createVelclawDomainConfig(env), createVelclawDomainConfig({}))
  }
})

for (const key of ENVIRONMENT_KEYS) {
  test(`the factory rejects a malformed origin in ${key}`, () => {
    for (const value of ['not an origin', '/relative/path', 'https://']) {
      const configuredValue = key === 'VELCLAW_ALLOWED_ORIGINS' ? `https://valid.example.test,${value}` : value
      assert.throws(() => createVelclawDomainConfig({ [key]: configuredValue }), /Invalid Velclaw origin:/)
    }
  })
}

test('whitespace-only origins fail instead of silently becoming defaults', () => {
  for (const key of ENVIRONMENT_KEYS.filter((key) => key !== 'VELCLAW_ALLOWED_ORIGINS')) {
    assert.throws(() => createVelclawDomainConfig({ [key]: '   ' }), /Invalid Velclaw origin:/)
  }
})

test('a separator-only allowlist contains no allowed origins', () => {
  for (const value of [' ', ',,,', ' , , ']) {
    assert.deepEqual(createVelclawDomainConfig({ VELCLAW_ALLOWED_ORIGINS: value }).allowedOrigins, [])
  }
})

test('overriding the public origin does not implicitly change the issuer or allowlist', () => {
  const config = createVelclawDomainConfig({ VELCLAW_PUBLIC_ORIGIN: 'https://CUSTOM.example.test:8443/path' })
  assert.equal(config.publicOrigin, 'https://custom.example.test:8443')
  assert.equal(config.publicDomain, 'custom.example.test')
  assert.equal(config.oauthIssuer, 'https://velclaw.site')
  assert.deepEqual(config.allowedOrigins, defaultOrigins)
})

test('factory calls do not mutate input or share their allowlist arrays', () => {
  const env = Object.freeze({ VELCLAW_ALLOWED_ORIGINS: 'https://one.example.test/path' })
  const first = createVelclawDomainConfig(env)
  first.allowedOrigins.push('https://unexpected.example.test')
  assert.deepEqual(createVelclawDomainConfig(env).allowedOrigins, ['https://one.example.test'])
  assert.equal(env.VELCLAW_ALLOWED_ORIGINS, 'https://one.example.test/path')
  assert.deepEqual(createVelclawDomainConfig({}).allowedOrigins, defaultOrigins)
})

test('the no-argument factory reads the current environment on each call', (t) => {
  const previous = process.env.VELCLAW_PUBLIC_ORIGIN
  t.after(() => {
    if (previous === undefined) delete process.env.VELCLAW_PUBLIC_ORIGIN
    else process.env.VELCLAW_PUBLIC_ORIGIN = previous
  })
  for (const origin of ['https://first.example.test', 'https://second.example.test']) {
    process.env.VELCLAW_PUBLIC_ORIGIN = origin
    assert.equal(createVelclawDomainConfig().publicOrigin, origin)
    assert.equal(createVelclawDomainConfig({}).publicOrigin, 'https://velclaw.site')
  }
})
