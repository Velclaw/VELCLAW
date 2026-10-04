import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import Cookies from 'js-cookie'

// Exercise the actual dependency at the document.cookie boundary without a DOM
// emulator. The stub supplies browser reads and captures writes for inspection.
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
