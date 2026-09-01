import assert from 'node:assert/strict'
import test from 'node:test'
import { createCurlPlan, executeCurlPlanInSandbox } from '@/lib/velclaw/integrations/curl'
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

test('curl adapter keeps GET explicit when a body is supplied', () => {
  const plan = createCurlPlan({
    method: 'GET',
    url: 'https://example.com/search',
    body: 'query=velclaw',
  })

  const requestIndex = plan.args.indexOf('--request')
  assert.ok(requestIndex >= 0)
  assert.equal(plan.args[requestIndex + 1], 'GET')
})

test('curl sandbox executor enforces a streamed response cap', async () => {
  let capturedCommand = ''
  let capturedArgs: string[] = []

  const sandbox = {
    runCommand: async (command: string, args: string[]) => {
      capturedCommand = command
      capturedArgs = args
      return {
        exitCode: 0,
        stdout: async () => '',
        stderr: async () => '',
      }
    },
  }

  const result = await executeCurlPlanInSandbox(
    sandbox as never,
    createCurlPlan({ url: 'https://example.com', maxResponseBytes: 1024 }),
    1024,
  )

  assert.equal(result.success, true)
  assert.equal(capturedCommand, 'sh')
  assert.equal(capturedArgs[0], '-c')
  assert.match(capturedArgs[1], /head -c 1025/)
  assert.match(capturedArgs[1], /CURL_RESPONSE_TOO_LARGE/)
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

test('ibm cloud adapter preserves service URL path prefixes', () => {
  const plan = createIbmCloudRequestPlan({
    serviceUrl: 'https://example.cloud.ibm.com/gateway/api',
    path: '/v1/resources',
    accessToken: 'test-token',
  })

  assert.equal(plan.url, 'https://example.cloud.ibm.com/gateway/api/v1/resources')
})

test('integration registry exposes the three provider boundaries', () => {
  const ids = new Set(VELCLAW_INTEGRATIONS.map((integration) => integration.id))
  assert.ok(ids.has('curl-network'))
  assert.ok(ids.has('mdn-web-platform'))
  assert.ok(ids.has('ibm-cloud'))
})
