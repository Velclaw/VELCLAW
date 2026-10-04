import assert from 'node:assert/strict'
import { once } from 'node:events'
import test, { type TestContext } from 'node:test'
import WebSocket, { WebSocketServer } from 'ws'

async function connect(t: TestContext, maxPayload = 1024) {
  const server = new WebSocketServer({ host: '127.0.0.1', port: 0, maxPayload })
  t.after(async () => {
    for (const socket of server.clients) socket.terminate()
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  })
  await once(server, 'listening', { signal: t.signal })
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  const connected = once(server, 'connection', { signal: t.signal })
  const client = new WebSocket(`ws://127.0.0.1:${address.port}`)
  t.after(() => client.terminate())
  const [[peer]] = await Promise.all([connected, once(client, 'open', { signal: t.signal })])
  return { client, peer: peer as WebSocket }
}

test('realtime transport preserves JSON, Unicode and binary messages', { timeout: 5000 }, async (t) => {
  const { client, peer } = await connect(t)
  const message = JSON.stringify({ type: 'system', message: 'Connected 🌍' })
  const received = once(client, 'message', { signal: t.signal })
  peer.send(message)
  const [data, isBinary] = await received
  assert.equal(isBinary, false)
  assert.deepEqual(JSON.parse(data.toString()), JSON.parse(message))

  const binary = Buffer.from([0, 255, 128, 1])
  const receivedBinary = once(peer, 'message', { signal: t.signal })
  client.send(binary)
  const [bytes, binaryFlag] = await receivedBinary
  assert.equal(binaryFlag, true)
  assert.deepEqual(bytes, binary)
})

test('realtime transport accepts a payload at its configured limit', { timeout: 5000 }, async (t) => {
  const { client, peer } = await connect(t, 32)
  const received = once(peer, 'message', { signal: t.signal })
  client.send('x'.repeat(32))
  const [data] = await received
  assert.equal(data.toString(), 'x'.repeat(32))
})

test('realtime transport rejects a payload above its configured limit', { timeout: 5000 }, async (t) => {
  const { client, peer } = await connect(t, 32)
  let delivered = false
  peer.on('message', () => {
    delivered = true
  })
  const rejected = once(peer, 'error', { signal: t.signal })
  const closed = once(client, 'close', { signal: t.signal })
  client.send('x'.repeat(33))
  const [[error], [code]] = await Promise.all([rejected, closed])
  assert.equal(error.code, 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH')
  assert.equal(code, 1009)
  assert.equal(delivered, false)
})

test('realtime transport preserves normal close status and reason', { timeout: 5000 }, async (t) => {
  const { client, peer } = await connect(t)
  const closed = once(peer, 'close', { signal: t.signal })
  client.close(1000, 'finished')
  const [code, reason] = await closed
  assert.equal(code, 1000)
  assert.equal(reason.toString(), 'finished')
})
