import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import test, { type TestContext } from 'node:test'
import ts from 'typescript'

const configSource = readFileSync(new URL('../tsconfig.json', import.meta.url), 'utf8')

// Use TypeScript's file discovery on a small fixture tree so these tests exercise
// glob semantics without compiling the application or depending on build output.
function discoverFiles(t: TestContext, files: string[]) {
  const root = mkdtempSync(join(tmpdir(), 'velclaw-dashboard-tsconfig-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const file of files) {
    const path = join(root, file)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, 'export {}\n')
  }

  const configPath = join(root, 'tsconfig.json')
  const { config, error } = ts.parseConfigFileTextToJson(configPath, configSource)
  assert.equal(error, undefined, 'Root TypeScript configuration must parse')
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, root, undefined, configPath)
  assert.deepEqual(parsed.errors, [], 'Root TypeScript configuration must discover files without errors')
  return parsed.fileNames.map((file) => relative(root, file).split('\\').join('/')).sort()
}

test('root TypeScript discovery excludes dashboard sources at every directory depth', (t) => {
  const included = 'app/page.tsx'
  const excluded = [
    'dashboard-skeleton/vite.config.ts',
    'dashboard-skeleton/src/main.tsx',
    'dashboard-skeleton/src/pages/Dashboard.tsx',
    'dashboard-skeleton/src/lib/helpers.ts',
    'dashboard-skeleton/src/types/environment.d.ts',
  ]

  assert.deepEqual(discoverFiles(t, [included, ...excluded]), [included])
})

test('dashboard exclusion preserves root application, shared code, and regression tests', (t) => {
  const included = [
    'app/dashboard/page.tsx',
    'components/dashboard.tsx',
    'lib/dashboard.ts',
    'next-env.d.ts',
    'tests/dashboard-logo-asset.test.ts',
  ]

  assert.deepEqual(discoverFiles(t, [...included, 'dashboard-skeleton/src/App.tsx']), included.sort())
})

test('dashboard exclusion is limited to the exact root directory', (t) => {
  const included = [
    'dashboard-skeleton.ts',
    'dashboard-skeleton-preview/src/App.tsx',
    'app/dashboard-skeleton/page.tsx',
  ]

  assert.deepEqual(discoverFiles(t, [...included, 'dashboard-skeleton/src/App.tsx']), included.sort())
})
