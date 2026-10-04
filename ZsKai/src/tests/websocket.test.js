import { describe, expect, it } from 'vitest'
import WebSocket from 'ws'

describe('WebSocket dependency input validation', () => {
  it.each(['not a URL', 'ftp://example.test/', 'ws://example.test/#fragment'])(
    'rejects invalid endpoint %j before connecting',
    (url) => expect(() => new WebSocket(url)).toThrow(SyntaxError),
  )

  it.each([['chat', 'chat'], ['invalid protocol'], ['chat\r\ninjected']])(
    'rejects invalid or duplicated subprotocols: %j',
    (...protocols) => expect(() => new WebSocket('ws://example.test/', protocols)).toThrow(SyntaxError),
  )
})
