import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test, { type TestContext } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const validator = path.join(root, 'scripts/ci-runtime-validation.mjs')
const schema = 'https://openapi.vercel.sh/vercel.json'

function fixture(t: TestContext) {
  const directory = mkdtempSync(path.join(tmpdir(), 'velclaw-runtime-validation-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))

  // Use real runtime contracts so a success proves the validator reached its end.
  // Each case mutates its own copy, never the checkout or another case's inputs.
  for (const entry of [
    'package.json',
    'pnpm-lock.yaml',
    'next.config.ts',
    'Dockerfile',
    'deploy',
    'app/api/deployments',
    'lib/deploy/store.ts',
    '.github/workflows/kubeops-bootstrap-secrets.yml',
  ]) {
    const destination = path.join(directory, entry)
    mkdirSync(path.dirname(destination), { recursive: true })
    cpSync(path.join(root, entry), destination, { recursive: true })
  }
  for (const entry of ['components', 'server']) mkdirSync(path.join(directory, entry))

  return {
    write(file: string, contents: string) {
      writeFileSync(path.join(directory, file), contents)
    },
    run() {
      const result = spawnSync(process.execPath, [validator], {
        cwd: directory,
        encoding: 'utf8',
        timeout: 5_000,
      })
      assert.ifError(result.error)
      assert.equal(result.signal, null)
      return result
    },
  }
}

test('self-hosted runtime validation succeeds without a Vercel configuration', (t) => {
  const result = fixture(t).run()
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Runtime validation passed:/)
  assert.equal(result.stderr, '')
})

test('runtime validation accepts the current multi-service Vercel configuration', (t) => {
  const project = fixture(t)
  project.write('vercel.json', readFileSync(path.join(root, 'vercel.json'), 'utf8'))
  const result = project.run()
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Runtime validation passed:/)
})

for (const [label, value] of [
  ['missing', undefined],
  ['null', null],
  ['empty', ''],
  ['non-string', 123],
  ['insecure URL', 'http://openapi.vercel.sh/vercel.json'],
  ['different host', 'https://example.test/vercel.json'],
  ['trailing slash', `${schema}/`],
  ['trailing whitespace', `${schema} `],
] as const) {
  test(`runtime validation rejects a ${label} Vercel schema`, (t) => {
    const project = fixture(t)
    project.write('vercel.json', JSON.stringify({ $schema: value }))
    const result = project.run()
    assert.equal(result.status, 1)
    assert.match(result.stderr, /vercel\.json must use the current Vercel schema/)
    assert.doesNotMatch(result.stdout, /Runtime validation passed/)
  })
}

test('runtime validation fails closed when vercel.json contains malformed JSON', (t) => {
  const project = fixture(t)
  project.write('vercel.json', '{"$schema":')
  const result = project.run()
  assert.equal(result.status, 1)
  assert.match(result.stderr, /SyntaxError/)
  assert.doesNotMatch(result.stdout, /Runtime validation passed/)
})

test('a valid Vercel schema does not bypass the self-hosted static-export guard', (t) => {
  const project = fixture(t)
  project.write('vercel.json', JSON.stringify({ $schema: schema }))
  project.write('next.config.ts', 'export default { output: "export" }')
  const result = project.run()
  assert.equal(result.status, 1)
  assert.match(result.stderr, /static export is incompatible/)
  assert.doesNotMatch(result.stdout, /Runtime validation passed/)
})

test('deployment API validation accepts the hostname helper without the legacy domain literal', (t) => {
  const project = fixture(t)
  const source = readFileSync(path.join(root, 'app/api/deployments/route.ts'), 'utf8')
  assert.ok(source.includes('isVelclawHostname'))
  project.write('app/api/deployments/route.ts', source.replaceAll('velclaw\\.cfd', 'legacy-domain.invalid'))
  const result = project.run()
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Runtime validation passed:/)
})

test('the legacy domain literal cannot replace the deployment API hostname helper', (t) => {
  const project = fixture(t)
  const source = readFileSync(path.join(root, 'app/api/deployments/route.ts'), 'utf8')
  assert.ok(source.includes('isVelclawHostname'))
  project.write('app/api/deployments/route.ts', source.replaceAll('isVelclawHostname', 'velclaw\\.cfd'))
  const result = project.run()
  assert.equal(result.status, 1)
  assert.match(result.stderr, /deployment API contract is missing: isVelclawHostname/)
  assert.doesNotMatch(result.stdout, /Runtime validation passed/)
})
