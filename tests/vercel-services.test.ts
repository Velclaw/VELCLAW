import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

type Rewrite = {
  source: string
  destination: string
  has?: Array<{ type: string; key: string; value: string }>
}

type DeploymentConfig = {
  $schema: string
  framework: string
  installCommand: string
  buildCommand: string
  redirects: Array<{ source: string; destination: string; permanent: boolean }>
  rewrites: Rewrite[]
}

const config: DeploymentConfig = JSON.parse(
  readFileSync(fileURLToPath(new URL('../vercel.json', import.meta.url)), 'utf8'),
)
const askApp = 'https://ask-ocodejs.vercel.app'
const docsApp = 'https://ocodejs-docs.vercel.app'

test('Vercel config uses the root Next.js application and its package scripts', () => {
  assert.equal(config.$schema, 'https://openapi.vercel.sh/vercel.json')
  assert.equal(config.framework, 'nextjs')
  assert.equal(config.installCommand, 'pnpm install --no-frozen-lockfile')
  assert.equal(config.buildCommand, 'pnpm run build')
})

test('application subpaths redirect bare paths to their slash-terminated forms', () => {
  assert.deepEqual(config.redirects, [
    { source: '/OCodejs', destination: '/OCodejs/', permanent: true },
    { source: '/docs.velclaw.ai', destination: '/docs.velclaw.ai/', permanent: true },
    { source: '/docs-ocodejs', destination: '/docs-ocodejs/', permanent: true },
  ])
})

test('Ask OCode.js route forwards the application subpath to its verified app host', () => {
  const route = config.rewrites.find((rewrite) => rewrite.source === '/OCodejs/(.*)')
  assert.ok(route)
  assert.equal(route.destination, `${askApp}/OCodejs/$1`)
  assert.equal(new RegExp(`^${route.source}$`).test('/OCodejs/chat'), true)
  assert.equal(new RegExp(`^${route.source}$`).test('/OCodejs-old/chat'), false)
})

test('OCode.js documentation routes target the dedicated docs deployment', () => {
  const bare = config.rewrites.find((rewrite) => rewrite.source === '/docs-ocodejs')
  const nested = config.rewrites.find((rewrite) => rewrite.source === '/docs-ocodejs/(.*)')
  assert.ok(bare)
  assert.ok(nested)
  assert.equal(bare.destination, `${docsApp}/`)
  assert.equal(nested.destination, `${docsApp}/$1`)
})

test('Velclaw documentation aliases resolve to the local docs path', () => {
  assert.equal(
    config.rewrites.find((rewrite) => rewrite.source === '/docs.velclaw.ai')?.destination,
    '/docs',
  )
  assert.equal(
    config.rewrites.find((rewrite) => rewrite.source === '/docs.velclaw.ai/(.*)')?.destination,
    '/docs/$1',
  )
})

test('Ask OCode.js API rewrites are scoped to requests originating from its subpath', () => {
  for (const [source, destination] of [
    ['/api/(.*)', `${askApp}/api/$1`],
    ['/v1/chat', `${askApp}/v1/chat`],
    ['/chat', `${askApp}/chat`],
    ['/health', `${askApp}/health`],
  ]) {
    const route = config.rewrites.find((rewrite) => rewrite.source === source)
    assert.ok(route, `missing rewrite for ${source}`)
    assert.equal(route.destination, destination)
    assert.deepEqual(route.has, [
      { type: 'header', key: 'referer', value: '.*/OCodejs.*' },
    ])
  }
})
