import assert from 'node:assert/strict'
import { readFileSync, realpathSync, statSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

type Service = {
  root: string
  framework?: string
  runtime?: string
  buildCommand?: string
  outputDirectory?: string
}

type DeploymentConfig = {
  $schema: string
  services: Record<string, Service>
  rewrites: Array<{ source: string; destination: { service: string } }>
}

const repositoryRoot = realpathSync(fileURLToPath(new URL('..', import.meta.url)))
const config: DeploymentConfig = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

// These mappings are the deployment contract: directory casing and the distinction
// between a framework and a runtime matter on the deployment filesystem.
const expectedServices: Record<string, Service> = {
  app: { root: '.', framework: 'nextjs' },
  agentside: { root: 'AgentsIDE', framework: 'vite' },
  autoship: { root: 'Autoship', framework: 'vite' },
  docs: { root: '.', buildCommand: 'pip install -r docs/requirements.txt && mkdocs build', outputDirectory: 'site' },
  kio: { root: 'KIO', runtime: 'node' },
  velclaw: { root: 'Velclaw', framework: 'nextjs' },
  'velclaw-docs': { root: 'velclaw-docs', framework: 'vite' },
  'velclaw-pages': { root: 'velclaw-pages', runtime: 'node' },
  zskai: { root: 'ZsKai', framework: 'vite' },
  'huggingface-space-kimi-demo': { root: 'ZsKai/huggingface-space-kimi-demo', runtime: 'python' },
  zvelclaw: { root: 'Zvelclaw', runtime: 'container' },
}

test('deployment configuration declares the Vercel schema and complete service topology', () => {
  assert.equal(config.$schema, 'https://openapi.vercel.sh/vercel.json')
  assert.deepEqual(Object.keys(config.services).sort(), Object.keys(expectedServices).sort())
})

for (const [name, expected] of Object.entries(expectedServices)) {
  test(`service ${name} uses its designated root and deployment mode`, () => {
    assert.deepEqual(config.services[name], expected)

    const root = realpathSync(path.resolve(repositoryRoot, config.services[name].root))
    const relativeRoot = path.relative(repositoryRoot, root)
    assert.ok(statSync(root).isDirectory(), `${name} must point to a directory`)
    assert.ok(
      relativeRoot !== '..' && !relativeRoot.startsWith(`..${path.sep}`) && !path.isAbsolute(relativeRoot),
      `${name} must remain inside the repository`,
    )
  })
}

test('static documentation uses the Vite documentation app and its existing HTML entrypoint', () => {
  const service = config.services['velclaw-docs']
  assert.equal(service.framework, 'vite')
  assert.equal(Object.hasOwn(service, 'runtime'), false)
  assert.ok(statSync(path.join(repositoryRoot, service.root, 'index.html')).isFile())
  assert.notEqual(service.root, config.services.docs.root)
})

test('rewrites reference declared services', () => {
  for (const rewrite of config.rewrites) {
    assert.ok(Object.hasOwn(config.services, rewrite.destination.service), rewrite.source)
  }
})

test('documentation routes precede the app catch-all and target the Python docs service', () => {
  assert.deepEqual(config.rewrites, [
    { source: '/docs/(.*)', destination: { service: 'docs' } },
    { source: '/(.*)', destination: { service: 'app' } },
  ])
})

test('the documentation source pattern preserves the slash boundary', () => {
  // Check the configured pattern only; this does not emulate Vercel routing or URL normalization.
  const docsRewrite = config.rewrites.find((rewrite) => rewrite.destination.service === 'docs')
  assert.ok(docsRewrite)
  const pattern = new RegExp(`^${docsRewrite.source}$`)

  for (const pathname of ['/docs/', '/docs/getting-started', '/docs/api/reference.html']) {
    assert.equal(pattern.test(pathname), true, pathname)
  }
  for (const pathname of ['/', '/docs', '/docs-old/guide', '/documentation/guide', '/api/docs/guide']) {
    assert.equal(pattern.test(pathname), false, pathname)
  }
})

test('the app catch-all source pattern includes the homepage, bare docs path, APIs, and assets', () => {
  const fallback = config.rewrites.at(-1)
  assert.ok(fallback)
  assert.equal(fallback.destination.service, 'app')
  const pattern = new RegExp(`^${fallback.source}$`)

  for (const pathname of ['/', '/docs', '/docs-old/guide', '/api/health', '/_next/static/chunk.js', '/repos/a/b']) {
    assert.equal(pattern.test(pathname), true, pathname)
  }
})

test('the Vite docs service has a build script and a resolvable module entrypoint', () => {
  const docsRoot = path.join(repositoryRoot, config.services['velclaw-docs'].root)
  const manifest = JSON.parse(readFileSync(path.join(docsRoot, 'package.json'), 'utf8'))
  assert.equal(manifest.scripts.build, 'vite build')
  assert.equal(manifest.type, 'module')
  assert.ok(manifest.devDependencies.vite)
  assert.ok(manifest.devDependencies['@vitejs/plugin-react'])
  const entry = readFileSync(path.join(docsRoot, 'index.html'), 'utf8')
  const modulePath = entry.match(/<script\s+type="module"\s+src="([^"<>]+)"/)
  assert.ok(modulePath, 'the docs HTML must load the Vite application')
  assert.ok(statSync(path.join(docsRoot, modulePath[1])).isFile())
})

test('the MkDocs build inputs resolve from its separately configured repository root', () => {
  const docsRoot = path.join(repositoryRoot, config.services.docs.root)
  for (const filename of ['mkdocs.yml', 'docs/requirements.txt']) {
    assert.ok(statSync(path.join(docsRoot, filename)).isFile(), filename)
  }
  assert.equal(config.services.docs.outputDirectory, 'site')
  assert.notEqual(config.services['velclaw-docs'].outputDirectory, 'site')
})
