import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'))

test('Monaco resolves the exact DOMPurify release required by its dependency contract', () => {
  const monaco = lock.packages['node_modules/monaco-editor']
  // npm resolves a nested copy first; checking only the top-level entry can miss a stale sanitizer.
  const sanitizer =
    lock.packages['node_modules/monaco-editor/node_modules/dompurify'] ?? lock.packages['node_modules/dompurify']
  assert.ok(sanitizer, 'Monaco must have a locked sanitizer')
  assert.equal(sanitizer.version, monaco.dependencies.dompurify)
  assert.equal(new URL(sanitizer.resolved).protocol, 'https:')
  assert.match(sanitizer.integrity, /^sha512-[A-Za-z0-9+/]+={0,2}$/)
})
