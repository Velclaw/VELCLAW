import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

// Both entrypoints had syntax errors that prevented any runtime behavior.
// Parse the complete files without starting the publisher loop or browser app.
for (const file of ['deploy/kubernetes-publisher.mjs', 'velclaw-pages/agent-runtime.js']) {
  test(`${file} is valid JavaScript before any credentials or browser APIs are accessed`, () => {
    const result = spawnSync(process.execPath, ['--check', fileURLToPath(new URL(`../${file}`, import.meta.url))], {
      encoding: 'utf8',
      timeout: 5_000,
    })
    assert.ifError(result.error)
    assert.equal(result.signal, null)
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.stderr, '')
  })
}
