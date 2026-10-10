import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, realpathSync, statSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

type Service = {
  root: string
  framework?: string
  runtime?: string
  entrypoint?: string
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
  docs: {
    root: '.',
    framework: 'vite',
    buildCommand: 'pip install -r docs/requirements.txt && mkdocs build',
    outputDirectory: 'site',
  },
  kio: { root: 'KIO', runtime: 'node', entrypoint: 'server.js' },
  velclaw: { root: 'Velclaw', framework: 'nextjs' },
  'velclaw-docs': { root: 'velclaw-docs', framework: 'vite' },
  'velclaw-pages': { root: 'velclaw-pages', runtime: 'node', entrypoint: 'server.js' },
  zskai: { root: 'ZsKai', framework: 'vite' },
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

for (const name of ['kio', 'velclaw-pages']) {
  test(`service ${name} declares an entrypoint that parses in its package's Node module mode`, () => {
    const service = config.services[name]
    const entrypoint = service.entrypoint
    assert.ok(entrypoint, 'Node services must declare an entrypoint')
    // Syntax checking respects each package's CommonJS/ESM mode without starting a server.
    assert.doesNotThrow(() => {
      execFileSync(process.execPath, ['--check', entrypoint], {
        cwd: path.resolve(repositoryRoot, service.root),
        timeout: 10_000,
        stdio: 'pipe',
      })
    }, 'the configured entrypoint must be valid for the Node runtime in its service root')
  })

  test(`service ${name} resolves its Node entrypoint within its own root and matches its start script`, () => {
    const service = config.services[name]
    assert.equal(service.runtime, 'node')
    assert.equal(Object.hasOwn(service, 'framework'), false)
    assert.ok(service.entrypoint, 'Node services must declare an entrypoint')
    assert.equal(path.isAbsolute(service.entrypoint), false, 'entrypoints must be relative to the service root')

    const root = realpathSync(path.resolve(repositoryRoot, service.root))
    const entrypoint = realpathSync(path.resolve(root, service.entrypoint))
    const relativeEntrypoint = path.relative(root, entrypoint)
    assert.ok(statSync(entrypoint).isFile(), 'the entrypoint must resolve to an existing file')
    assert.ok(
      relativeEntrypoint !== '..' &&
        !relativeEntrypoint.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relativeEntrypoint),
      'the entrypoint must remain inside its service root',
    )

    const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
    assert.equal(manifest.scripts.start, `node ${service.entrypoint}`)
  })
}

test('the Hugging Face demo is neither deployed under an alias nor referenced by a rewrite', () => {
  const retiredName = 'huggingface-space-kimi-demo'
  const retiredRoot = path.resolve(repositoryRoot, 'ZsKai/huggingface-space-kimi-demo')
  assert.equal(Object.hasOwn(config.services, retiredName), false)
  for (const service of Object.values(config.services)) {
    assert.notEqual(realpathSync(path.resolve(repositoryRoot, service.root)), retiredRoot)
  }
  assert.equal(
    config.rewrites.some((rewrite) => rewrite.destination.service === retiredName),
    false,
  )
  assert.equal(config.services.zskai.root, 'ZsKai', 'the parent application must remain deployed')
})

test('the MkDocs service keeps its custom static build despite the Vite framework setting', () => {
  const service = config.services.docs
  assert.equal(service.framework, 'vite')
  assert.equal(service.buildCommand, 'pip install -r docs/requirements.txt && mkdocs build')
  assert.equal(service.outputDirectory, 'site')
  assert.equal(Object.hasOwn(service, 'runtime'), false)
  assert.equal(Object.hasOwn(service, 'entrypoint'), false)
})

test('static documentation uses the Vite documentation app and its existing HTML entrypoint', () => {
  const service = config.services['velclaw-docs']
  assert.equal(service.framework, 'vite')
  assert.equal(Object.hasOwn(service, 'runtime'), false)
  assert.ok(statSync(path.join(repositoryRoot, service.root, 'index.html')).isFile())
  assert.notEqual(service.root, config.services.docs.root)
})

test('the Vite docs service resolves a buildable React application from its configured root', () => {
  const root = path.join(repositoryRoot, config.services['velclaw-docs'].root)
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
  assert.equal(pkg.scripts.build, 'vite build')
  assert.ok(pkg.dependencies.react)
  assert.ok(pkg.dependencies['react-dom'])
  assert.ok(pkg.devDependencies.vite)
  assert.ok(pkg.devDependencies['@vitejs/plugin-react'])

  const html = readFileSync(path.join(root, 'index.html'), 'utf8')
  const entrypoint = html.match(/<script\s+type="module"\s+src="([^"]+)"/)
  assert.ok(entrypoint, 'the Vite HTML entrypoint must load an application module')
  assert.ok(statSync(path.join(root, entrypoint[1])).isFile())
})

test('the docs CI workflow builds the dedicated Vite service on relevant PRs and pushes', () => {
  const workflow = readFileSync(path.join(repositoryRoot, '.github/workflows/velclaw-docs.yml'), 'utf8')
  // Follow the repository's source-contract test convention without adding a YAML dependency.
  for (const event of ['pull_request', 'push']) {
    const block = workflow.match(new RegExp(`^  ${event}:\\n((?:    .*\\n)+)`, 'm'))?.[1]
    assert.ok(block, `${event} must trigger docs validation`)
    assert.match(block, /branches: \["main"\]/)
    assert.match(block, /"velclaw-docs\/\*\*"/)
    assert.match(block, /"\.github\/workflows\/velclaw-docs\.yml"/)
  }
  assert.match(workflow, /permissions:\n  contents: read/)
  assert.match(workflow, /defaults:\n      run:\n        working-directory: velclaw-docs/)
  assert.match(workflow, /node-version: 22\.x/)
  assert.match(workflow, /cache-dependency-path: velclaw-docs\/package\.json/)
  assert.match(workflow, /run: npm install --no-package-lock[\s\S]+run: npm run build/)
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
