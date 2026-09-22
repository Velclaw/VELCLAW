import assert from 'node:assert/strict'
import test from 'node:test'

const ENVIRONMENT_KEYS = [
  'VELCLAW_PUBLIC_ORIGIN',
  'VELCLAW_OAUTH_ISSUER',
  'VELCLAW_APP_ORIGIN',
  'VELCLAW_API_ORIGIN',
  'VELCLAW_DOCS_ORIGIN',
  'VELCLAW_ALLOWED_ORIGINS',
] as const

type DomainConfigModule = typeof import('../lib/velclaw/domain-config')

let importSequence = 0

async function importDomainConfig(
  overrides: Partial<Record<(typeof ENVIRONMENT_KEYS)[number], string>> = {},
): Promise<DomainConfigModule> {
  const originalEnvironment = Object.fromEntries(ENVIRONMENT_KEYS.map((key) => [key, process.env[key]]))

  for (const key of ENVIRONMENT_KEYS) delete process.env[key]
  Object.assign(process.env, overrides)

  const moduleUrl = new URL('../lib/velclaw/domain-config.ts', import.meta.url)
  moduleUrl.searchParams.set('testRun', String(importSequence++))

  try {
    return await import(moduleUrl.href)
  } finally {
    for (const key of ENVIRONMENT_KEYS) {
      const value = originalEnvironment[key]
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
}

test('domain configuration defaults each surface to its designated first-party origin', async () => {
  const config = await importDomainConfig()

  assert.deepEqual(config.VELCLAW_DOMAIN_ROLES, {
    platform: 'https://velclaw.ai',
    developer: 'https://velclaw.dev',
    application: 'https://velclaw.app',
  })
  assert.equal(config.VELCLAW_PUBLIC_ORIGIN, config.VELCLAW_DOMAIN_ROLES.platform)
  assert.equal(config.VELCLAW_OAUTH_ISSUER, config.VELCLAW_DOMAIN_ROLES.platform)
  assert.equal(config.VELCLAW_APP_ORIGIN, config.VELCLAW_DOMAIN_ROLES.application)
  assert.equal(config.VELCLAW_API_ORIGIN, config.VELCLAW_DOMAIN_ROLES.developer)
  assert.equal(config.VELCLAW_DOCS_ORIGIN, config.VELCLAW_DOMAIN_ROLES.developer)
  assert.equal(config.VELCLAW_PUBLIC_DOMAIN, 'velclaw.ai')
  assert.deepEqual(config.VELCLAW_ALLOWED_ORIGINS, Object.values(config.VELCLAW_DOMAIN_ROLES))
})

test('configured origins are trimmed and reduced to scheme, host, and port', async () => {
  const config = await importDomainConfig({
    VELCLAW_PUBLIC_ORIGIN: ' https://console.example.test/products/ ',
    VELCLAW_OAUTH_ISSUER: 'https://identity.example.test/oauth',
    VELCLAW_APP_ORIGIN: 'http://app.example.test:4100/workspace/',
    VELCLAW_API_ORIGIN: 'https://api.example.test/v1?source=config',
    VELCLAW_DOCS_ORIGIN: 'https://docs.example.test/reference#start',
    VELCLAW_ALLOWED_ORIGINS:
      ' https://one.example.test/path, ,http://two.example.test:8080/callback,https://one.example.test/other ',
  })

  assert.equal(config.VELCLAW_PUBLIC_ORIGIN, 'https://console.example.test')
  assert.equal(config.VELCLAW_OAUTH_ISSUER, 'https://identity.example.test')
  assert.equal(config.VELCLAW_APP_ORIGIN, 'http://app.example.test:4100')
  assert.equal(config.VELCLAW_API_ORIGIN, 'https://api.example.test')
  assert.equal(config.VELCLAW_DOCS_ORIGIN, 'https://docs.example.test')
  assert.equal(config.VELCLAW_PUBLIC_DOMAIN, 'console.example.test')
  assert.deepEqual(config.VELCLAW_ALLOWED_ORIGINS, [
    'https://one.example.test',
    'http://two.example.test:8080',
    'https://one.example.test',
  ])
})

test('invalid configured origins fail fast', async () => {
  await assert.rejects(
    importDomainConfig({ VELCLAW_PUBLIC_ORIGIN: 'not an origin' }),
    /Invalid Velclaw origin: not an origin/,
  )
  await assert.rejects(
    importDomainConfig({ VELCLAW_ALLOWED_ORIGINS: 'https://velclaw.ai,not an origin' }),
    /Invalid Velclaw origin: not an origin/,
  )
})

test('known bare, www, case-insensitive, and port-qualified hosts resolve to their roles', async () => {
  const { getVelclawDomainRole } = await importDomainConfig()
  const cases = [
    ['velclaw.ai', 'platform'],
    ['www.velclaw.ai', 'platform'],
    ['VELCLAW.AI', 'platform'],
    ['velclaw.ai:3000', 'platform'],
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

test('missing, unknown, and lookalike hosts safely use the platform role', async () => {
  const { getVelclawDomainRole } = await importDomainConfig()

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

test('role origins, content, and aggregate configuration remain aligned', async () => {
  const config = await importDomainConfig()
  const roles = ['platform', 'developer', 'application'] as const
  const aggregate = config.getVelclawDomainConfig()

  assert.deepEqual(Object.keys(config.VELCLAW_DOMAIN_ROLE_CONTENT), roles)
  for (const role of roles) {
    const content = config.VELCLAW_DOMAIN_ROLE_CONTENT[role]
    assert.equal(config.getVelclawOriginForRole(role), config.VELCLAW_DOMAIN_ROLES[role])
    assert.ok(content.name.length > 0)
    assert.ok(content.title.length > 0)
    assert.ok(content.description.length > 0)
    assert.ok(content.heading.length > 0)
    assert.ok(content.intro.length > 0)
  }

  assert.deepEqual(aggregate, {
    roles: config.VELCLAW_DOMAIN_ROLES,
    publicOrigin: config.VELCLAW_PUBLIC_ORIGIN,
    oauthIssuer: config.VELCLAW_OAUTH_ISSUER,
    appOrigin: config.VELCLAW_APP_ORIGIN,
    apiOrigin: config.VELCLAW_API_ORIGIN,
    docsOrigin: config.VELCLAW_DOCS_ORIGIN,
    publicDomain: config.VELCLAW_PUBLIC_DOMAIN,
    allowedOrigins: config.VELCLAW_ALLOWED_ORIGINS,
  })
})
