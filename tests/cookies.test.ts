import assert from 'node:assert/strict'
import test, { beforeEach, afterEach } from 'node:test'
import Cookies from 'js-cookie'
import { getSelectedRepo, setSelectedRepo, getSidebarOpen, setSidebarOpen } from '../lib/utils/cookies'

// Only the browser cookie storage boundary is replaced; js-cookie's encoding,
// parsing and the application's preference helpers run unmocked.
let cookieHeader: string
let writtenCookie: string
let previousDocument: PropertyDescriptor | undefined
let previousWindow: PropertyDescriptor | undefined

beforeEach(() => {
  cookieHeader = ''
  writtenCookie = ''
  previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
  previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} })
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      get cookie() {
        return cookieHeader
      },
      set cookie(value: string) {
        writtenCookie = value
      },
    },
  })
})

afterEach(() => {
  for (const [key, descriptor] of [
    ['document', previousDocument],
    ['window', previousWindow],
  ] as const) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor)
    else Reflect.deleteProperty(globalThis, key)
  }
})

for (const value of ['velclaw', 'owner/repo=name', 'space and Unicode 🌍', 'repo; injected=true', '100% complete']) {
  test(`repository preference round trips ${JSON.stringify(value)}`, () => {
    setSelectedRepo(value)
    const [pair, ...attributes] = writtenCookie.split('; ')
    assert.match(pair, /^selected-repo=/)
    assert.equal(pair.includes(';'), false)
    assert.ok(attributes.includes('path=/'))
    assert.ok(attributes.includes('sameSite=strict'))
    assert.ok(attributes.some((attribute) => attribute.startsWith('expires=')))
    // A browser returns the stored name/value pair without Set-Cookie attributes.
    cookieHeader = pair
    assert.equal(getSelectedRepo(), value)
    assert.equal(Cookies.get('injected'), undefined)
  })
}

test('malformed percent-encoded cookies do not prevent reading a valid preference', () => {
  cookieHeader = 'broken=%E0%A4%A; selected-repo=valid; another=%ZZ'
  assert.equal(getSelectedRepo(), 'valid')
  assert.equal(Cookies.get('broken'), undefined)
})

test('cookie names are matched exactly, including when similar names appear first', () => {
  cookieHeader = 'selected-repository=wrong; x-selected-repo=wrong; selected-repo=correct'
  assert.equal(getSelectedRepo(), 'correct')
})

test('boolean preferences retain an explicit false value', () => {
  setSidebarOpen(false)
  cookieHeader = writtenCookie.split('; ')[0]
  assert.equal(cookieHeader, 'sidebar-open=false')
  assert.equal(getSidebarOpen(), false)
  setSidebarOpen(true)
  cookieHeader = writtenCookie.split('; ')[0]
  assert.equal(getSidebarOpen(), true)
})

test('clearing a repository preference expires the same cookie path', () => {
  setSelectedRepo('')
  assert.match(writtenCookie, /^selected-repo=; /)
  assert.match(writtenCookie, /; path=\//)
  const expires = /; expires=([^;]+)/.exec(writtenCookie)
  assert.ok(expires)
  assert.ok(Date.parse(expires[1]) < Date.now())
  cookieHeader = ''
  assert.equal(getSelectedRepo(), '')
})

test('preferences remain safe during server rendering without browser globals', () => {
  Reflect.deleteProperty(globalThis, 'window')
  Reflect.deleteProperty(globalThis, 'document')
  assert.equal(getSelectedRepo(), '')
  assert.equal(getSidebarOpen(), false)
  assert.doesNotThrow(() => setSelectedRepo('ignored'))
  assert.equal(writtenCookie, '')
})
