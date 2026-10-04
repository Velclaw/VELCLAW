import { describe, expect, it } from 'vitest'
import { Address4, Address6, AddressError } from 'ip-address'

describe('ip-address dependency regressions', () => {
  it.each(['https://192.0.2.1:443/', 'https://example.com/', 'http://[1:2:3:4:5:6:7:8:9]/', 'http://[:::]/', ''])(
    'returns a failure object without throwing for %j',
    (url) => {
      expect(Address6.fromURL(url)).toEqual({
        error: expect.any(String),
        address: null,
        port: null,
      })
    },
  )

  it.each([0, 443, 65535, 65536])('handles IPv6 URL port %i', (port) => {
    const result = Address6.fromURL(`https://[2001:db8::1]:${port}/path?q=1`)
    expect(result.address.correctForm()).toBe('2001:db8::1')
    expect(result.port).toBe(port <= 65535 ? port : null)
  })

  it('parses a bracketed IPv6 URL without a port', () => {
    const result = Address6.fromURL('https://[2001:db8::1]/path')
    expect(result.address.correctForm()).toBe('2001:db8::1')
    expect(result.port).toBeNull()
  })

  it.each(['ip6.arpa.', 'IP6.ARPA.', 'Ip6.ArPa', 'ip6.arpa'])(
    'accepts reverse DNS suffix %s for delegated networks',
    (suffix) => {
      const address = Address6.fromArpa(`8.b.d.0.1.0.0.2.${suffix}`)
      expect(address.networkForm()).toBe('2001:db8::/32')
    },
  )

  it('round trips a full reverse DNS address', () => {
    const address = new Address6('2001:db8::abcd')
    const restored = Address6.fromArpa(address.reverseForm())
    expect(restored.correctForm()).toBe('2001:db8::abcd')
    expect(restored.subnetMask).toBe(128)
  })

  it.each(['', 'g.ip6.arpa.', '8..b.ip6.arpa.', `${'0.'.repeat(33)}ip6.arpa.`])(
    'rejects malformed reverse DNS input %j',
    (input) => expect(() => Address6.fromArpa(input)).toThrow(AddressError),
  )

  it('does not confuse matching leading bits from different address families', () => {
    const ipv4 = new Address4('10.0.0.1/8')
    const ipv6 = new Address6('a00::1/8')
    expect(ipv4.isInSubnet(ipv6)).toBe(false)
    expect(ipv6.isInSubnet(ipv4)).toBe(false)
    expect(ipv4.isHostInSubnet(ipv6)).toBe(false)
    expect(ipv6.isHostInSubnet(ipv4)).toBe(false)
    expect(ipv4.isInSubnet(new Address4('10.0.0.0/8'))).toBe(true)
    expect(ipv6.isInSubnet(new Address6('a00::/8'))).toBe(true)
  })

  it.each([
    [Address4, '127.0.0.1/0'],
    [Address4, '10.0.0.1/0'],
    [Address4, '192.0.2.1'],
    [Address6, '::1/0'],
    [Address6, 'fc00::1/0'],
    [Address6, '2001:db8::1'],
  ])('keeps special-purpose addresses non-global: %s %s', (Address, value) => {
    expect(new Address(value).isGlobal()).toBe(false)
  })

  it.each([
    [Address4, '8.8.8.8'],
    [Address6, '2606:4700:4700::1111'],
  ])('recognizes globally reachable addresses: %s %s', (Address, value) => {
    expect(new Address(value).isGlobal()).toBe(true)
  })

  it.each([
    [Address4, '192.0.2.255/24', '192.0.3.0/24'],
    [Address6, '2001:db8::ffff/64', '2001:db8:0:1::/64'],
  ])('advances to the next network without mutating the address: %s', (Address, value, next) => {
    const address = new Address(value)
    const original = address.correctForm()
    expect(address.nextNetwork().networkForm()).toBe(next)
    expect(address.correctForm()).toBe(original)
    expect(address.offset(0).correctForm()).toBe(original)
  })

  it.each([
    [Address4, '0.0.0.0', -1],
    [Address4, '255.255.255.255', 1],
    [Address6, '::', -1],
    [Address6, 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff', 1],
    [Address4, '192.0.2.1', 0.5],
    [Address6, '2001:db8::1', Number.MAX_SAFE_INTEGER + 1],
  ])('rejects out-of-range or non-integral offsets: %s %s %s', (Address, value, offset) => {
    expect(() => new Address(value).offset(offset)).toThrow(AddressError)
  })

  it.each([Address4, Address6])('rejects overlong untrusted input: %s', (Address) => {
    expect(() => new Address('1'.repeat(10000))).toThrow(AddressError)
  })
})
