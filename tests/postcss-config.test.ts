import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { getPostCssPlugins } from 'next/dist/build/webpack/config/blocks/css/plugins'
import config from '../postcss.config.mjs'

// Use the processor supplied with the declared plugin dependency, including under pnpm.
const require = createRequire(import.meta.url)
const postcss = createRequire(require.resolve('@tailwindcss/postcss'))('postcss')
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))

async function processCss(css: string, fixture: string) {
  return postcss(config.plugins).process(css, {
    from: fileURLToPath(new URL(`./postcss-${fixture}.css`, import.meta.url)),
    map: false,
  })
}

test('the exported configuration registers an executable Tailwind PostCSS plugin', () => {
  const processor = postcss(config.plugins)
  assert.ok(processor.plugins.some((plugin: { postcssPlugin: string }) => plugin.postcssPlugin === 'tailwindcss'))
})

test('the application Next.js loader accepts the PostCSS configuration', async () => {
  // Exercise the same config loader used by the declared webpack build, without building the app.
  const plugins = await getPostCssPlugins(repositoryRoot, undefined)
  assert.ok(plugins.length > 0)
})

for (const [name, css] of [
  ['empty input', ''],
  ['ordinary CSS', '/* preserve me */\n.card { color: rebeccapurple; --gap: 0; margin: var(--gap); }'],
] as const) {
  test(`the configured pipeline preserves ${name} without Tailwind directives`, async () => {
    const result = await processCss(css, name.replaceAll(' ', '-'))
    assert.equal(result.css, css)
    assert.deepEqual(result.warnings(), [])
  })
}

test('the configured pipeline resolves Tailwind imports and expands utilities with apply', async () => {
  const result = await processCss(
    `@import "tailwindcss" source(none);
     .card { @apply flex items-center; }`,
    'apply',
  )

  assert.match(result.css, /\.card\s*\{\s*display:\s*flex;\s*align-items:\s*center;/)
  assert.doesNotMatch(result.css, /@import|@apply|@tailwind|@source/)
  assert.deepEqual(result.warnings(), [])
})

test('inline theme values and explicitly sourced variants produce usable CSS', async () => {
  const result = await processCss(
    `@import "tailwindcss" source(none);
     @theme inline { --color-brand: var(--brand); }
     @source inline("bg-brand hover:underline w-[13px]");`,
    'theme-and-variants',
  )

  assert.match(result.css, /\.bg-brand\s*\{\s*background-color:\s*var\(--brand\);/)
  assert.ok(result.css.includes('.hover\\:underline'))
  assert.match(result.css, /text-decoration-line:\s*underline/)
  assert.ok(result.css.includes('.w-\\[13px\\]'))
  assert.match(result.css, /width:\s*13px/)
  assert.doesNotMatch(result.css, /@import|@theme|@source|@tailwind/)
  assert.deepEqual(result.warnings(), [])
})

test('reusing the configuration does not leak utilities between independent stylesheets', async () => {
  const first = await processCss('@import "tailwindcss" source(none); @source inline("flex");', 'first-stylesheet')
  const second = await processCss(
    '@import "tailwindcss" source(none); @source inline("underline");',
    'second-stylesheet',
  )

  assert.match(first.css, /\.flex\s*\{\s*display:\s*flex;/)
  assert.doesNotMatch(first.css, /\.underline\s*\{/)
  assert.match(second.css, /\.underline\s*\{\s*text-decoration-line:\s*underline;/)
  assert.doesNotMatch(second.css, /\.flex\s*\{/)
})

test('unknown utilities in apply reject CSS processing instead of silently dropping styles', async () => {
  await assert.rejects(
    processCss('@import "tailwindcss" source(none); .card { @apply not-a-real-utility; }', 'unknown-utility'),
    /Cannot apply unknown utility class `not-a-real-utility`/,
  )
})

test('malformed CSS rejects with a CSS syntax error', async () => {
  await assert.rejects(processCss('.card { color: red;', 'malformed'), {
    name: 'CssSyntaxError',
    reason: 'Unclosed block',
  })
})
