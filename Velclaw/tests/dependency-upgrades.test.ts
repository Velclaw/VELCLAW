import assert from 'node:assert/strict'
import { once } from 'node:events'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import { gzipSync } from 'node:zlib'
import WebSocket, { WebSocketServer } from 'ws'

// Follow the AI SDK dependency edge instead of relying on npm hoisting Undici.
const require = createRequire(import.meta.url)
const aiRequire = createRequire(require.resolve('ai'))
const providerRequire = createRequire(aiRequire.resolve('@ai-sdk/provider-utils'))
const { MockAgent, interceptors } = providerRequire('undici')

// DOMPurify/Monaco run in a browser, which this project's Node test runner does
// not provide. Guard the npm dependency edge that delivers the sanitizer fix.
test('Monaco resolves to the patched DOMPurify dependency in the npm lockfile', () => {
  const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'))
  const monaco = lock.packages['node_modules/monaco-editor']
  const purifier =
    lock.packages['node_modules/monaco-editor/node_modules/dompurify'] ?? lock.packages['node_modules/dompurify']
  assert.equal(monaco.dependencies.dompurify, purifier.version)
  const [major, minor, patch] = purifier.version.split('.').map(Number)
  assert.ok(major > 3 || (major === 3 && (minor > 4 || (minor === 4 && patch >= 15))))
})

/**
 * Creates an Undici mock agent with real network access disabled and automatic test cleanup.
 * @param t - Test context that closes the agent after the test.
 * @returns The agent and mock pool for https://api.example.test.
 */
function mockOrigin(t: test.TestContext) {
  const agent = new MockAgent()
  agent.disableNetConnect()
  t.after(() => agent.close())
  return { agent, origin: agent.get('https://api.example.test') }
}

test('Undici shared cache reuses an ordinary cacheable GET response', { timeout: 5000 }, async (t) => {
  const { agent, origin } = mockOrigin(t)
  const client = agent.compose(interceptors.cache({ type: 'shared' }))
  origin.intercept({ path: '/public', method: 'GET' }).reply(200, 'public data', {
    headers: { 'cache-control': 'public, max-age=3600' },
  })
  for (let request = 0; request < 2; request++) {
    const response = await client.request({ origin: 'https://api.example.test', path: '/public', method: 'GET' })
    assert.equal(await response.body.text(), 'public data')
  }
  agent.assertNoPendingInterceptors()
})

test('Undici shared cache never replays another response containing Set-Cookie', { timeout: 5000 }, async (t) => {
  const { agent, origin } = mockOrigin(t)
  const client = agent.compose(interceptors.cache({ type: 'shared' }))
  for (const user of ['first', 'second']) {
    origin.intercept({ path: '/session', method: 'GET' }).reply(200, user, {
      headers: { 'cache-control': 'public, max-age=3600', 'set-cookie': `session=${user}; HttpOnly` },
    })
  }
  for (const user of ['first', 'second']) {
    const response = await client.request({ origin: 'https://api.example.test', path: '/session', method: 'GET' })
    assert.equal(await response.body.text(), user)
    assert.equal(response.headers['set-cookie'], `session=${user}; HttpOnly`)
  }
  agent.assertNoPendingInterceptors()
})

for (const method of ['POST', 'DELETE'] as const) {
  test(`Undici rejects unsafe ${method} cache configuration`, () => {
    assert.throws(() => interceptors.cache({ methods: ['GET', method] }), /safe|method/i)
  })
}

for (const cacheControl of ['private, max-age=3600', 'no-store']) {
  test(`Undici shared cache respects ${cacheControl}`, { timeout: 5000 }, async (t) => {
    const { agent, origin } = mockOrigin(t)
    const client = agent.compose(interceptors.cache({ type: 'shared' }))
    for (const body of ['first response', 'second response']) {
      origin.intercept({ path: '/private', method: 'GET' }).reply(200, body, {
        headers: { 'cache-control': cacheControl },
      })
    }
    for (const body of ['first response', 'second response']) {
      const response = await client.request({ origin: 'https://api.example.test', path: '/private', method: 'GET' })
      assert.equal(await response.body.text(), body)
    }
    agent.assertNoPendingInterceptors()
  })
}

test('Undici decompression rejects corrupt gzip data', { timeout: 5000 }, async (t) => {
  const { agent, origin } = mockOrigin(t)
  const client = agent.compose(interceptors.decompress({ maxSize: 32 }))
  origin.intercept({ path: '/corrupt', method: 'GET' }).reply(200, Buffer.from('not a gzip stream'), {
    headers: { 'content-encoding': 'gzip' },
  })
  await assert.rejects(
    async () => {
      const response = await client.request({ origin: 'https://api.example.test', path: '/corrupt', method: 'GET' })
      await response.body.text()
    },
    { code: 'Z_DATA_ERROR' },
  )
  agent.assertNoPendingInterceptors()
})

for (const size of [31, 32, 33]) {
  test(`Undici enforces the decoded response limit at ${size} bytes`, { timeout: 5000 }, async (t) => {
    const { agent, origin } = mockOrigin(t)
    const payload = 'x'.repeat(size)
    const compressed = gzipSync(payload)
    const client = agent.compose(interceptors.decompress({ maxSize: 32 }))
    origin.intercept({ path: '/compressed', method: 'GET' }).reply(200, compressed, {
      headers: { 'content-encoding': 'gzip', 'content-length': String(compressed.length) },
    })
    const read = async () => {
      const response = await client.request({ origin: 'https://api.example.test', path: '/compressed', method: 'GET' })
      assert.equal(response.headers['content-encoding'], undefined)
      return response.body.text()
    }
    if (size <= 32) assert.equal(await read(), payload)
    else await assert.rejects(read, { code: 'UND_ERR_RES_EXCEEDED_MAX_SIZE' })
    agent.assertNoPendingInterceptors()
  })
}

/**
 * Opens a WebSocket pair on an ephemeral loopback port and registers socket and server cleanup.
 * @param t - Test context that tears down the connection after the test.
 * @param maxPayload - Maximum message size accepted by the server, in bytes; defaults to 1024.
 * @returns A promise resolving to the connected client and server-side peer.
 */
async function websocketPair(t: test.TestContext, maxPayload = 1024) {
  const server = new WebSocketServer({ host: '127.0.0.1', port: 0, maxPayload })
  let client: WebSocket | undefined
  t.after(async () => {
    client?.terminate()
    for (const socket of server.clients) socket.terminate()
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  })
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const connected = once(server, 'connection')
  client = new WebSocket(`ws://127.0.0.1:${address.port}`)
  const [[peer]] = await Promise.all([connected, once(client, 'open')])
  return { client, peer: peer as WebSocket }
}

test('ws preserves realtime JSON messages, binary frames and clean close codes', { timeout: 5000 }, async (t) => {
  const { client, peer } = await websocketPair(t)
  const welcome = { type: 'system', message: 'Velclaw realtime connected' }
  const received = once(client, 'message')
  peer.send(JSON.stringify(welcome))
  const [data, binary] = await received
  assert.equal(binary, false)
  assert.deepEqual(JSON.parse(data.toString()), welcome)

  const uploaded = once(peer, 'message')
  client.send(Buffer.from([0, 127, 255]))
  const [bytes, isBinary] = await uploaded
  assert.equal(isBinary, true)
  assert.deepEqual(bytes, Buffer.from([0, 127, 255]))

  const closed = once(client, 'close')
  peer.close(1000, 'done')
  const [code, reason] = await closed
  assert.equal(code, 1000)
  assert.equal(reason.toString(), 'done')
})

test('ws accepts the payload limit and rejects one byte over it', { timeout: 5000 }, async (t) => {
  const { client, peer } = await websocketPair(t, 32)
  const received = once(peer, 'message')
  client.send('x'.repeat(32))
  const [data] = await received
  assert.equal(data.length, 32)

  const error = once(peer, 'error')
  const closed = once(client, 'close')
  client.send('x'.repeat(33))
  const [failure] = await error
  assert.equal(failure.code, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH')
  const [code] = await closed
  assert.equal(code, 1009)
})

test('ws enforces the payload limit across fragmented messages', { timeout: 5000 }, async (t) => {
  const { client, peer } = await websocketPair(t, 32)
  const received = once(peer, 'message')
  client.send('x'.repeat(16), { fin: false })
  client.send('y'.repeat(16), { fin: true })
  const [data] = await received
  assert.equal(data.toString(), 'x'.repeat(16) + 'y'.repeat(16))

  const error = once(peer, 'error')
  const closed = once(client, 'close')
  client.send('x'.repeat(16), { fin: false })
  client.send('y'.repeat(17), { fin: true })
  const [failure] = await error
  assert.equal(failure.code, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH')
  const [code] = await closed
  assert.equal(code, 1009)
})
