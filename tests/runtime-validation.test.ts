import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test, { type TestContext } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const validator = path.join(root, 'scripts/ci-runtime-validation.mjs')

// Copy only the validator's inputs; never mutate the checkout or run deployment services.
function runtimeFixture(t: TestContext) {
  const directory = mkdtempSync(path.join(tmpdir(), 'velclaw-runtime-validation-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  for (const filename of [
    'package.json',
    'pnpm-lock.yaml',
    'next.config.ts',
    'Dockerfile',
    'deploy/docker-compose.selfhosted.yml',
    'deploy/publisher.Dockerfile',
    'deploy/runtime-publisher.mjs',
    'deploy/kubernetes-publisher.mjs',
    'deploy/kubernetes-publisher-v2.mjs',
    'deploy/kubernetes-publisher.Dockerfile',
    'deploy/kubernetes/namespace.yaml',
    'deploy/kubernetes/publisher-rbac.yaml',
    'deploy/kubernetes/velclaw.yaml',
    'deploy/kubernetes/publisher.yaml',
    'deploy/kubernetes/kustomization.yaml',
    'deploy/traefik.yml',
    '.github/workflows/kubeops-bootstrap-secrets.yml',
    'app/api/deployments/claim/route.ts',
    'lib/deploy/store.ts',
    'app/api/deployments/[id]/rollback/route.ts',
    'app/api/deployments/route.ts',
  ]) {
    const destination = path.join(directory, filename)
    mkdirSync(path.dirname(destination), { recursive: true })
    copyFileSync(path.join(root, filename), destination)
  }
  for (const folder of ['components', 'server']) mkdirSync(path.join(directory, folder))
  return directory
}

function validate(directory: string) {
  const result = spawnSync(process.execPath, [validator], { cwd: directory, encoding: 'utf8', timeout: 5000 })
  assert.ifError(result.error)
  assert.equal(result.signal, null)
  return result
}

for (const withVercel of [false, true]) {
  test(`runtime validation accepts the runtime with Vercel configuration ${withVercel ? 'present' : 'absent'}`, (t) => {
    const directory = runtimeFixture(t)
    if (withVercel) copyFileSync(path.join(root, 'vercel.json'), path.join(directory, 'vercel.json'))
    const result = validate(directory)
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /Runtime validation passed:/)
    assert.equal(result.stderr, '')
  })
}

for (const schema of [undefined, null, '', 'https://example.test/old-schema.json']) {
  test(`runtime validation rejects an invalid Vercel schema: ${JSON.stringify(schema)}`, (t) => {
    const directory = runtimeFixture(t)
    writeFileSync(path.join(directory, 'vercel.json'), JSON.stringify({ $schema: schema }))
    const result = validate(directory)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /vercel.json must use the current Vercel schema/)
    assert.doesNotMatch(result.stdout, /Runtime validation passed/)
  })
}

test('runtime validation rejects malformed Vercel JSON', (t) => {
  const directory = runtimeFixture(t)
  writeFileSync(path.join(directory, 'vercel.json'), '{')
  const result = validate(directory)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /SyntaxError/)
  assert.doesNotMatch(result.stdout, /Runtime validation passed/)
})

test('runtime validation requires the shared hostname guard in the deployment API', (t) => {
  const directory = runtimeFixture(t)
  const filename = path.join(directory, 'app/api/deployments/route.ts')
  const source = readFileSync(filename, 'utf8')
  assert.ok(source.includes('isVelclawHostname'))
  writeFileSync(filename, source.replaceAll('isVelclawHostname', 'legacyHostnameCheck'))
  const result = validate(directory)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /deployment API contract is missing: isVelclawHostname/)
})

test('Kubernetes publisher parses and reaches its missing-token guard without cluster access', () => {
  // The manifest delimiter regression prevented even startup validation from running.
  // This entry point has no exports and starts a polling loop when fully configured.
  const result = spawnSync(process.execPath, [path.join(root, 'deploy/kubernetes-publisher.mjs')], {
    cwd: root,
    env: { ...process.env, VELCLAW_DEPLOY_API_TOKEN: '' },
    encoding: 'utf8',
    timeout: 5000,
  })
  assert.ifError(result.error)
  assert.equal(result.signal, null)
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Error: VELCLAW_DEPLOY_API_TOKEN is required/)
  assert.doesNotMatch(result.stderr, /SyntaxError|In-cluster Kubernetes credentials/)
})
