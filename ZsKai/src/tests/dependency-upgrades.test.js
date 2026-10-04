import { describe, it, expect } from 'vitest'
import { createRequire } from 'node:module'
import { once } from 'node:events'
import postcss from 'postcss'
import WebSocket, { WebSocketServer } from 'ws'

// Resolve the transitive dependency from its consumer, including nested npm
// installs, so the regression exercises the version used by rate limiting.
const require = createRequire(import.meta.url)
const rateLimitRequire = createRequire(require.resolve('express-rate-limit'))
const { Address4, Address6, AddressError } = rateLimitRequire('ip-address')

describe('ip-address upgrade used by rate limiting', () => {
  it.each([
    ['2001:db8::1', '2001:db8::/32', true],
    ['2001:db9::1', '2001:db8::/32', false],
    ['2001:db8::', '2001:db8::/128', true],
    ['2001:db8::1', '2001:db8::/128', false],
  ])('classifies %s within %s as %s', (address, subnet, contained) => {
    expect(new Address6(address).isInSubnet(new Address6(subnet))).toBe(contained)
  })

  it('does not consider addresses of different families part of the same subnet', () => {
    expect(new Address4('0.0.0.1').isInSubnet(new Address6('::/0'))).toBe(false)
    expect(new Address6('::1').isInSubnet(new Address4('0.0.0.0/0'))).toBe(false)
  })

  it.each(['https://example.test/path', 'http://192.0.2.1:8080/', 'not-an-ip'])(
    'returns a structured failure instead of throwing for %s',
    (url) => {
      const result = Address6.fromURL(url)
      expect(result.address).toBeNull()
      expect(result.port).toBeNull()
      expect(result.error).toEqual(expect.any(String))
    },
  )

  it('parses a bracketed IPv6 host with a port', () => {
    const result = Address6.fromURL('https://[2001:db8::1]:8443/api')
    expect(result.address.correctForm()).toBe('2001:db8::1')
    expect(result.port).toBe(8443)
    expect(result.error).toBeUndefined()
  })

  it.each(['8.b.d.0.1.0.0.2.ip6.arpa.', '8.b.d.0.1.0.0.2.IP6.ARPA', '8.b.d.0.1.0.0.2.Ip6.ArPa.'])(
    'accepts prefix reverse DNS names with case and root-dot variations: %s',
    (name) => {
      expect(Address6.fromArpa(name).networkForm()).toBe('2001:db8::/32')
    },
  )

  it.each([
    [Address4, '192.0.2.42'],
    [Address6, '2001:db8::42'],
  ])('round-trips full reverse DNS names for %s', (Address, value) => {
    const address = new Address(value)
    expect(Address.fromArpa(address.reverseForm()).correctForm()).toBe(value)
  })

  it.each([
    [Address4, '1'.repeat(4096)],
    [Address6, 'a:'.repeat(4096)],
    [Address4, '256.0.0.1'],
    [Address6, '2001:::1'],
  ])('rejects malformed or oversized addresses for %s', (Address, value) => {
    expect(() => new Address(value)).toThrow(AddressError)
  })

  it('keeps subnet prefixes when advancing IPv4 and IPv6 networks', () => {
    expect(new Address4('192.0.2.42/24').nextNetwork().networkForm()).toBe('192.0.3.0/24')
    expect(new Address6('2001:db8::42/64').nextNetwork().networkForm()).toBe('2001:db8:0:1::/64')
    expect(new Address6('2001:db8::1/64').offset(-1).correctForm()).toBe('2001:db8::')
  })

  it('rejects arithmetic beyond the address space instead of wrapping', () => {
    expect(() => new Address4('255.255.255.255').offset(1)).toThrow(AddressError)
    expect(() => new Address6('::').offset(-1)).toThrow(AddressError)
    expect(() => new Address6('ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/128').nextNetwork()).toThrow(AddressError)
    expect(() => new Address4('192.0.2.1').offset(0.5)).toThrow(AddressError)
  })
})

describe('PostCSS upgrade', () => {
  it('preserves custom properties, Unicode and nested rules through an AST round-trip', () => {
    const css = '/* café */\n.card { --accent: #123; color: var(--accent); &:hover { color: red } }'
    expect(postcss.parse(css).toString()).toBe(css)
  })

  it('runs declaration plugins and retains source information', async () => {
    const result = await postcss([
      {
        postcssPlugin: 'dependency-regression',
        Declaration(declaration) {
          if (declaration.prop === 'color' && declaration.value === 'red') {
            declaration.value = 'blue'
          }
        },
      },
    ]).process('.card { color: red; --custom: red }', {
      from: 'input.css',
      to: 'output.css',
      map: { inline: false },
    })
    expect(result.css).toContain('color: blue; --custom: red')
    expect(result.map.toJSON().sources).toEqual(['input.css'])
    expect(result.warnings()).toEqual([])
  })

  it('reports malformed input as a CSS syntax error with its source line', () => {
    expect(() => postcss.parse('.card {\n color: red', { from: 'broken.css' })).toThrow(
      expect.objectContaining({ name: 'CssSyntaxError', reason: 'Unclosed block', line: 1 }),
    )
  })

  it('accepts an empty stylesheet', async () => {
    const result = await postcss([]).process('', { from: undefined })
    expect(result.css).toBe('')
    expect(result.root.nodes).toHaveLength(0)
  })
})

describe('ws upgrade', () => {
  it('exchanges text and binary frames and closes cleanly', async () => {
    const server = new WebSocketServer({ host: '127.0.0.1', port: 0 })
    let client
    try {
      await once(server, 'listening')
      const connected = once(server, 'connection')
      client = new WebSocket(`ws://127.0.0.1:${server.address().port}`)
      const [[peer]] = await Promise.all([connected, once(client, 'open')])
      const incoming = once(peer, 'message')
      client.send(JSON.stringify({ type: 'message', text: 'hello' }))
      const [data, binary] = await incoming
      expect(binary).toBe(false)
      expect(JSON.parse(data.toString())).toEqual({ type: 'message', text: 'hello' })

      const outgoing = once(client, 'message')
      peer.send(Buffer.from([0, 255]))
      const [bytes, isBinary] = await outgoing
      expect(bytes).toEqual(Buffer.from([0, 255]))
      expect(isBinary).toBe(true)

      const closed = once(client, 'close')
      peer.close(1000, 'done')
      const [code, reason] = await closed
      expect(code).toBe(1000)
      expect(reason.toString()).toBe('done')
    } finally {
      client?.terminate()
      for (const socket of server.clients) socket.terminate()
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
    }
  }, 5000)
})
