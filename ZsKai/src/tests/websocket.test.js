import { once } from 'node:events'
import { describe, expect, it } from 'vitest'
import WebSocket, { Receiver } from 'ws'

describe('WebSocket dependency input validation', () => {
  it('reassembles a UTF-8 character split across text continuation frames', async () => {
    const receiver = new Receiver({ isServer: false, maxPayload: 4 })
    try {
      const received = once(receiver, 'message')
      // Unmasked server frames split the four-byte UTF-8 encoding of 🌍 in half.
      receiver.write(Buffer.from([0x01, 0x02, 0xf0, 0x9f]))
      receiver.write(Buffer.from([0x80, 0x02, 0x8c, 0x8d]))
      const [data, binary] = await received
      expect(data.toString()).toBe('🌍')
      expect(binary).toBe(false)
    } finally {
      receiver.destroy()
    }
  }, 1000)

  it('rejects invalid UTF-8 text without delivering a message', async () => {
    const receiver = new Receiver({ isServer: false })
    const messages = []
    receiver.on('message', (data) => messages.push(data))
    try {
      const rejected = once(receiver, 'error')
      receiver.write(Buffer.from([0x81, 0x02, 0xc0, 0xaf]))
      const [error] = await rejected
      expect(error.code).toBe('WS_ERR_INVALID_UTF8')
      expect(messages).toEqual([])
    } finally {
      receiver.destroy()
    }
  }, 1000)

  it('accepts the same non-UTF-8 bytes in a binary frame', async () => {
    const receiver = new Receiver({ isServer: false })
    try {
      const received = once(receiver, 'message')
      receiver.write(Buffer.from([0x82, 0x02, 0xc0, 0xaf]))
      const [data, binary] = await received
      expect(data).toEqual(Buffer.from([0xc0, 0xaf]))
      expect(binary).toBe(true)
    } finally {
      receiver.destroy()
    }
  }, 1000)

  it.each(['not a URL', 'ftp://example.test/', 'ws://example.test/#fragment'])(
    'rejects invalid endpoint %j before connecting',
    (url) => expect(() => new WebSocket(url)).toThrow(SyntaxError),
  )

  it.each([['chat', 'chat'], ['invalid protocol'], ['chat\r\ninjected']])(
    'rejects invalid or duplicated subprotocols: %j',
    (...protocols) => expect(() => new WebSocket('ws://example.test/', protocols)).toThrow(SyntaxError),
  )
})
