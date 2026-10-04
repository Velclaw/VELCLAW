import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import Cookies from 'js-cookie'

/**
 * Installs a document.cookie stub for browser reads and write inspection without a DOM emulator.
 * @param t - Test context that restores the original document property after the test.
 * @param initial - Initial cookie string exposed by the stub; defaults to an empty string.
 * @returns The mutable document stub containing the latest cookie assignment.
 */
function cookieDocument(t: test.TestContext, initial = '') {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document')
  const document = { cookie: initial }
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document })
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'document', original)
    else Reflect.deleteProperty(globalThis, 'document')
  })
  return document
}

test('the cookie lockfile resolution satisfies the exact manifest pin', () => {
  const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  const lock = readFileSync(new URL('../pnpm-lock.yaml', import.meta.url), 'utf8')
  const entry = lock.match(/^      js-cookie:\n        specifier: (\S+)\n        version: (\S+)/m)
  assert.ok(entry, 'Expected a js-cookie importer in the pnpm lockfile')
  assert.equal(entry[1], manifest.dependencies['js-cookie'])
  assert.equal(entry[2], entry[1], 'The pinned cookie version must remain installable with --frozen-lockfile')
})

for (const value of ['Velclaw', 'team/repo=main', 'space and + percent %', '日本語', 'x; secure; path=/admin']) {
  test(`cookie values round-trip without injecting attributes: ${value}`, (t) => {
    const document = cookieDocument(t)
    Cookies.set('selected-repo', value, { sameSite: 'strict', expires: 365 })
    const [pair, ...attributes] = document.cookie.split('; ')
    assert.equal(attributes.length, 3)
    assert.ok(attributes.includes('path=/'))
    assert.ok(attributes.includes('sameSite=strict'))
    assert.ok(attributes.some((attribute) => attribute.startsWith('expires=')))
    document.cookie = pair
    assert.equal(Cookies.get('selected-repo'), value)
  })
}

test('malformed percent encoding does not prevent reading another preference', (t) => {
  cookieDocument(t, 'broken=%E0%A4%A; selected-repo=velclaw; sidebar-open=false')
  assert.equal(Cookies.get('broken'), undefined)
  assert.equal(Cookies.get('selected-repo'), 'velclaw')
  assert.equal(Cookies.get('sidebar-open'), 'false')
})

test('cookie removal expires the same name and default path', (t) => {
  const document = cookieDocument(t)
  Cookies.remove('selected-owner')
  assert.match(document.cookie, /^selected-owner=; path=\/; expires=/)
  const expiry = document.cookie.match(/expires=([^;]+)/)
  assert.ok(expiry)
  assert.ok(Date.parse(expiry[1]) < Date.now())
})

test('cookie operations are safe during server rendering without document', (t) => {
  cookieDocument(t)
  Reflect.deleteProperty(globalThis, 'document')
  assert.equal(Cookies.get('selected-owner'), undefined)
  assert.equal(Cookies.set('selected-owner', 'velclaw'), undefined)
  assert.doesNotThrow(() => Cookies.remove('selected-owner'))
})

test('cookie lookup distinguishes an empty preference from a missing one and matches the entire name', (t) => {
  cookieDocument(t, 'selected-repo-backup=old; selected-repo=; owner-selected-repo=other')
  assert.equal(Cookies.get('selected-repo'), '')
  assert.equal(Cookies.get('missing'), undefined)
  assert.equal(Cookies.get('selected-repo-backup'), 'old')
})

test('cookie lookup keeps embedded equals signs in values', (t) => {
  cookieDocument(t, 'selected-repo=team/repo=main; selected-owner=velclaw')
  assert.equal(Cookies.get('selected-repo'), 'team/repo=main')
  assert.equal(Cookies.get('selected-owner'), 'velclaw')
})

test('cookie removal honors an explicit path and domain', (t) => {
  const document = cookieDocument(t)
  Cookies.remove('selected-repo', { path: '/repos', domain: 'example.test', secure: true, sameSite: 'strict' })
  const [pair, ...attributes] = document.cookie.split('; ')
  assert.equal(pair, 'selected-repo=')
  assert.ok(attributes.includes('path=/repos'))
  assert.ok(attributes.includes('domain=example.test'))
  assert.ok(attributes.includes('secure'))
  assert.ok(attributes.includes('sameSite=strict'))
  assert.ok(!attributes.includes('path=/'))
  const expiry = attributes.find((attribute) => attribute.startsWith('expires='))
  assert.ok(expiry)
  assert.ok(Date.parse(expiry.slice('expires='.length)) < Date.now())
})
