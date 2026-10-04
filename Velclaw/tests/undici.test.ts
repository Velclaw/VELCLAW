import assert from 'node:assert/strict'
import test, { type TestContext } from 'node:test'
import { createRequire } from 'node:module'
import { gzipSync } from 'node:zlib'

// Exercise the transitive dependency used by the sandbox SDK, including under pnpm.
const require = createRequire(import.meta.url)
const { MockAgent, fetch, interceptors, cacheStores } = createRequire(require.resolve('@vercel/sandbox'))('undici')
const origin = 'https://sandbox.example.test'

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

for (const method of ['POST', 'DELETE']) {
  test(`a successful ${method} invalidates a cached GET`, { timeout: 5000 }, async (t) => {
    const agent = mockAgent(t)
    const dispatcher = agent.compose(interceptors.cache({ store: new cacheStores.MemoryCacheStore(), type: 'shared' }))
    const pool = agent.get(origin)
    pool.intercept({ path: '/resource', method: 'GET' }).reply(200, 'before', {
      headers: { 'cache-control': 'public, max-age=3600' },
    })
    pool.intercept({ path: '/resource', method }).reply(204)
    pool.intercept({ path: '/resource', method: 'GET' }).reply(200, 'after', {
      headers: { 'cache-control': 'public, max-age=3600' },
    })

    // The second read must come from cache, and the mutation must evict it.
    for (const expected of ['before', 'before']) {
      const response = await dispatcher.request({ origin, path: '/resource', method: 'GET' })
      assert.equal(await response.body.text(), expected)
    }
    const mutation = await dispatcher.request({ origin, path: '/resource', method })
    assert.equal(mutation.statusCode, 204)
    await mutation.body.dump()
    const response = await dispatcher.request({ origin, path: '/resource', method: 'GET' })
    assert.equal(await response.body.text(), 'after')
    agent.assertNoPendingInterceptors()
  })
}

for (const plaintext of ['hello', '0123456789abcdefghijklmnopqrstuv']) {
  test(`nested gzip limits each decoding stage for ${plaintext.length} final bytes`, { timeout: 5000 }, async (t) => {
    const agent = mockAgent(t)
    const dispatcher = agent.compose(interceptors.decompress({ maxSize: 32 }))
    const inner = gzipSync(plaintext)
    agent
      .get(origin)
      .intercept({ path: '/nested' })
      .reply(200, gzipSync(inner), {
        headers: { 'content-encoding': 'gzip, gzip' },
      })
    const consume = async () => {
      const response = await dispatcher.request({ origin, path: '/nested', method: 'GET' })
      return response.body.text()
    }
    if (plaintext === 'hello') {
      assert.ok(inner.length <= 32)
      assert.equal(await consume(), plaintext)
    } else {
      // A small final body must not bypass the limit on an intermediate stage.
      assert.equal(Buffer.byteLength(plaintext), 32)
      assert.ok(inner.length > 32)
      await assert.rejects(consume(), { code: 'UND_ERR_RES_EXCEEDED_MAX_SIZE' })
    }
    agent.assertNoPendingInterceptors()
  })
}
