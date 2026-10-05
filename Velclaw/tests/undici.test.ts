import assert from 'node:assert/strict'
import test, { type TestContext } from 'node:test'
import { createRequire } from 'node:module'
import { brotliCompressSync, deflateSync, gzipSync } from 'node:zlib'

// Exercise the transitive dependency used by the sandbox SDK, including under pnpm.
const require = createRequire(import.meta.url)
const { MockAgent, BalancedPool, Pool, fetch, interceptors, cacheStores } = createRequire(
  require.resolve('@vercel/sandbox'),
)('undici')
const origin = 'https://sandbox.example.test'

/**
 * Creates an Undici mock agent with real network access disabled.
 * @param t - Test context that closes the agent after the test.
 * @returns The isolated agent used to intercept sandbox SDK HTTP requests.
 */
function mockAgent(t: TestContext) {
  const agent = new MockAgent()
  agent.disableNetConnect()
  t.after(() => agent.close())
  return agent
}

test('sandbox HTTP client preserves JSON request and response payloads', { timeout: 5000 }, async (t) => {
  const agent = mockAgent(t)
  const payload = { command: 'echo', args: ['hello 🌍'] }
  agent
    .get(origin)
    .intercept({ path: '/commands', method: 'POST', body: JSON.stringify(payload) })
    .reply(201, { id: 'command-1' }, { headers: { 'content-type': 'application/json' } })
  const response = await fetch(`${origin}/commands`, {
    dispatcher: agent,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), { id: 'command-1' })
  agent.assertNoPendingInterceptors()
})

test('sandbox HTTP client exposes error status and body', { timeout: 5000 }, async (t) => {
  const agent = mockAgent(t)
  agent.get(origin).intercept({ path: '/missing' }).reply(404, { error: 'not found' })
  const response = await fetch(`${origin}/missing`, { dispatcher: agent })
  assert.equal(response.ok, false)
  assert.equal(response.status, 404)
  assert.deepEqual(await response.json(), { error: 'not found' })
  agent.assertNoPendingInterceptors()
})

test('an already aborted request rejects without making a request', { timeout: 5000 }, async (t) => {
  const agent = mockAgent(t)
  const reason = new Error('cancelled by test')
  await assert.rejects(fetch(origin, { dispatcher: agent, signal: AbortSignal.abort(reason) }), reason)
})

test('shared cache reuses a public GET response', { timeout: 5000 }, async (t) => {
  const agent = mockAgent(t)
  const dispatcher = agent.compose(interceptors.cache({ store: new cacheStores.MemoryCacheStore(), type: 'shared' }))
  agent
    .get(origin)
    .intercept({ path: '/public' })
    .reply(200, 'public data', { headers: { 'cache-control': 'public, max-age=3600' } })
  for (let i = 0; i < 2; i++) {
    const { body } = await dispatcher.request({ origin, path: '/public', method: 'GET' })
    assert.equal(await body.text(), 'public data')
  }
  agent.assertNoPendingInterceptors()
})

for (const headers of [
  { 'cache-control': 'public, max-age=3600', 'set-cookie': 'session=synthetic; HttpOnly' },
  { 'cache-control': 'private, max-age=3600' },
  { 'cache-control': 'no-store' },
]) {
  test(`shared cache does not replay sensitive responses: ${JSON.stringify(headers)}`, { timeout: 5000 }, async (t) => {
    const agent = mockAgent(t)
    const dispatcher = agent.compose(interceptors.cache({ store: new cacheStores.MemoryCacheStore(), type: 'shared' }))
    for (const value of ['first caller', 'second caller']) {
      agent.get(origin).intercept({ path: '/private' }).reply(200, value, { headers })
    }
    for (const expected of ['first caller', 'second caller']) {
      const { body } = await dispatcher.request({ origin, path: '/private', method: 'GET' })
      assert.equal(await body.text(), expected)
    }
    agent.assertNoPendingInterceptors()
  })
}

for (const method of ['POST', 'DELETE']) {
  test(`shared cache never replays ${method} responses`, { timeout: 5000 }, async (t) => {
    const agent = mockAgent(t)
    const dispatcher = agent.compose(interceptors.cache({ store: new cacheStores.MemoryCacheStore() }))
    for (const value of ['first mutation', 'second mutation']) {
      agent
        .get(origin)
        .intercept({ path: '/resource', method })
        .reply(200, value, { headers: { 'cache-control': 'public, max-age=3600' } })
    }
    for (const expected of ['first mutation', 'second mutation']) {
      const { body } = await dispatcher.request({ origin, path: '/resource', method })
      assert.equal(await body.text(), expected)
    }
    agent.assertNoPendingInterceptors()
  })
}

for (const size of [31, 32, 33]) {
  test(`decompression enforces a 32-byte limit for ${size} decoded bytes`, { timeout: 5000 }, async (t) => {
    const agent = mockAgent(t)
    const dispatcher = agent.compose(interceptors.decompress({ maxSize: 32 }))
    const plaintext = 'x'.repeat(size)
    agent
      .get(origin)
      .intercept({ path: '/compressed' })
      .reply(200, gzipSync(plaintext), { headers: { 'content-encoding': 'gzip' } })
    const consume = async () => {
      const { body } = await dispatcher.request({ origin, path: '/compressed', method: 'GET' })
      return body.text()
    }
    if (size <= 32) {
      assert.equal(await consume(), plaintext)
    } else {
      await assert.rejects(consume(), { code: 'UND_ERR_RES_EXCEEDED_MAX_SIZE' })
    }
    agent.assertNoPendingInterceptors()
  })
}

for (const option of ['connect', 'tls'] as const) {
  test(`balanced pools retain ${option} certificate validation for initial and added upstreams`, async (t) => {
    const checkServerIdentity = () => new Error('certificate rejected by test')
    const settings = { rejectUnauthorized: true, checkServerIdentity }
    const created: string[] = []
    const pool = new BalancedPool([origin], {
      [option]: settings,
      factory(url: string, options: { connect?: typeof settings; tls?: typeof settings }) {
        assert.equal(options[option]?.checkServerIdentity, checkServerIdentity)
        assert.equal(options[option]?.rejectUnauthorized, true)
        created.push(url)
        return new Pool(url, options)
      },
    })
    t.after(() => pool.destroy())
    pool.addUpstream('https://second.example.test')
    assert.deepEqual(created, [origin, 'https://second.example.test'])
  })
}

for (const method of ['POST', 'DELETE']) {
  test(`a successful ${method} invalidates a previously cached GET`, { timeout: 5000 }, async (t) => {
    const agent = mockAgent(t)
    const dispatcher = agent.compose(interceptors.cache({ store: new cacheStores.MemoryCacheStore() }))
    const server = agent.get(origin)
    server.intercept({ path: '/resource', method: 'GET' }).reply(200, 'before', {
      headers: { 'cache-control': 'public, max-age=3600' },
    })
    server.intercept({ path: '/resource', method }).reply(200, 'updated')
    server.intercept({ path: '/resource', method: 'GET' }).reply(200, 'after', {
      headers: { 'cache-control': 'public, max-age=3600' },
    })

    for (const [verb, expected] of [
      ['GET', 'before'],
      ['GET', 'before'],
      [method, 'updated'],
      ['GET', 'after'],
      ['GET', 'after'],
    ]) {
      const response = await dispatcher.request({ origin, path: '/resource', method: verb })
      assert.equal(await response.body.text(), expected)
    }
    agent.assertNoPendingInterceptors()
  })
}

for (const [payload, accepted] of [
  ['🌍'.repeat(8), true],
  ['🌍'.repeat(8) + 'a', false],
] as const) {
  test(`decompression measures ${Buffer.byteLength(payload)} UTF-8 bytes`, { timeout: 5000 }, async (t) => {
    const agent = mockAgent(t)
    const dispatcher = agent.compose(interceptors.decompress({ maxSize: 32 }))
    agent
      .get(origin)
      .intercept({ path: '/unicode' })
      .reply(200, gzipSync(payload), {
        headers: { 'content-encoding': 'gzip' },
      })
    const consume = async () => {
      const response = await dispatcher.request({ origin, path: '/unicode', method: 'GET' })
      return response.body.text()
    }
    if (accepted) assert.equal(await consume(), payload)
    else await assert.rejects(consume(), { code: 'UND_ERR_RES_EXCEEDED_MAX_SIZE' })
    agent.assertNoPendingInterceptors()
  })
}

test('decompression limits intermediate output even when the final body fits', { timeout: 5000 }, async (t) => {
  const agent = mockAgent(t)
  const payload = 'ok'
  const inner = gzipSync(payload)
  assert.ok(inner.length > Buffer.byteLength(payload))
  const dispatcher = agent.compose(interceptors.decompress({ maxSize: Buffer.byteLength(payload) }))
  agent
    .get(origin)
    .intercept({ path: '/layered' })
    .reply(200, gzipSync(inner), {
      headers: { 'content-encoding': 'gzip, gzip' },
    })
  await assert.rejects(
    async () => {
      const response = await dispatcher.request({ origin, path: '/layered', method: 'GET' })
      await response.body.text()
    },
    { code: 'UND_ERR_RES_EXCEEDED_MAX_SIZE' },
  )
  agent.assertNoPendingInterceptors()
})

for (const [encoding, compress] of [
  ['deflate', deflateSync],
  ['br', brotliCompressSync],
] as const) {
  for (const size of [32, 33]) {
    test(`${encoding} decompression enforces the limit at ${size} bytes`, { timeout: 5000 }, async (t) => {
      const agent = mockAgent(t)
      const dispatcher = agent.compose(interceptors.decompress({ maxSize: 32 }))
      const payload = Buffer.alloc(size, 0x61)
      const compressed = compress(payload)
      agent
        .get(origin)
        .intercept({ path: '/compressed' })
        .reply(200, compressed, {
          headers: { 'content-encoding': encoding, 'content-length': String(compressed.length) },
        })
      const consume = async () => {
        const response = await dispatcher.request({ origin, path: '/compressed', method: 'GET' })
        assert.equal(response.headers['content-encoding'], undefined)
        assert.equal(response.headers['content-length'], undefined)
        return Buffer.from(await response.body.arrayBuffer())
      }
      if (size === 32) assert.deepEqual(await consume(), payload)
      else await assert.rejects(consume(), { code: 'UND_ERR_RES_EXCEEDED_MAX_SIZE' })
      agent.assertNoPendingInterceptors()
    })
  }
}

test('decompression decodes mixed encodings in reverse application order', { timeout: 5000 }, async (t) => {
  const agent = mockAgent(t)
  const dispatcher = agent.compose(interceptors.decompress({ maxSize: 1024 }))
  const payload = 'sandbox response 🌍'
  agent
    .get(origin)
    .intercept({ path: '/layered' })
    .reply(200, brotliCompressSync(gzipSync(payload)), { headers: { 'content-encoding': 'gzip, br' } })
  const response = await dispatcher.request({ origin, path: '/layered', method: 'GET' })
  assert.equal(await response.body.text(), payload)
  assert.equal(response.headers['content-encoding'], undefined)
  agent.assertNoPendingInterceptors()
})
