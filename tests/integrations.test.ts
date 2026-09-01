import assert from 'node:assert/strict'
import test from 'node:test'
import { createCurlPlan } from '@/lib/velclaw/integrations/curl'
import { createIbmCloudRequestPlan, getIbmCloudConfig } from '@/lib/velclaw/integrations/ibm-cloud'
import { mdnSearchUrl, resolveMdnReference } from '@/lib/velclaw/integrations/mdn'
import { VELCLAW_INTEGRATIONS } from '@/lib/velclaw/integrations'

test('curl adapter builds a sandbox-safe request plan', () => {
  const plan = createCurlPlan({
    method: 'post',
    url: 'https://example.com/api',
    headers: { Accept: 'application/json' },
    body: '{"ok":true}',
    timeoutSeconds: 10,
    followRedirects: true,
  })

  assert.equal(plan.command, 'curl')
  assert.deepEqual(plan.args.slice(0, 3), ['--fail-with-body', '--silent', '--show-error'])
  assert.ok(plan.args.includes('--location'))
  assert.ok(plan.args.includes('--request'))
  assert.ok(plan.args.includes('POST'))
  assert.ok(plan.args.includes('Accept: application/json'))
})

test('curl adapter rejects non-http protocols', () => {
  assert.throws(() => createCurlPlan({ url: 'file:///etc/passwd' }), /HTTP\(S\)/)
})

test('mdn resolver returns canonical references without mirroring content', () => {
  assert.equal(resolveMdnReference('fetch')?.url, 'https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch')
  assert.equal(resolveMdnReference('unknown concept'), null)
  assert.equal(mdnSearchUrl('fetch API'), 'https://developer.mozilla.org/en-US/search?q=fetch%20API')
})

test('ibm cloud adapter builds bearer-authenticated request descriptors', () => {
  assert.equal(getIbmCloudConfig().apiKeyEnv, 'IBM_CLOUD_API_KEY')

  const plan = createIbmCloudRequestPlan({
    serviceUrl: 'https://example.cloud.ibm.com',
    path: '/v1/resources',
    accessToken: 'test-token',
  })

  assert.equal(plan.url, 'https://example.cloud.ibm.com/v1/resources')
  assert.equal(plan.headers.Authorization, 'Bearer test-token')
})

test('integration registry exposes the three provider boundaries', () => {
  const ids = new Set(VELCLAW_INTEGRATIONS.map((integration) => integration.id))
  assert.ok(ids.has('curl-network'))
  assert.ok(ids.has('mdn-web-platform'))
  assert.ok(ids.has('ibm-cloud'))
})
