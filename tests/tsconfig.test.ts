import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const configPath = fileURLToPath(new URL('../tsconfig.json', import.meta.url))

const dashboardFiles = [
  'dashboard-skeleton/vite.config.ts',
  'dashboard-skeleton/src/main.tsx',
  'dashboard-skeleton/src/App.tsx',
  'dashboard-skeleton/src/layouts/Layout.tsx',
  'dashboard-skeleton/src/pages/Dashboard.tsx',
  'dashboard-skeleton/src/lib/api/client.ts',
  'dashboard-skeleton/src/vite-env.d.ts',
]

const applicationFiles = [
  'next-env.d.ts',
  'next.config.ts',
  'app/page.tsx',
  'app/api/health/route.ts',
  'components/dashboard.tsx',
  'lib/utils.ts',
  'tests/dashboard.test.ts',
]

const generatedTypeFiles = ['.next/types/app/page.ts', '.next/dev/types/app/api/health/route.ts']

const boundaryFiles = [
  'dashboard-skeleton.ts',
  'dashboard-skeleton.tsx',
  'dashboard-skeleton-tools/index.ts',
  'dashboard-skeleton-tools/src/Dashboard.tsx',
  'app/dashboard-skeleton/page.tsx',
  'lib/dashboard-skeleton/client.ts',
]

function rootProjectFiles(t: test.TestContext, extraFiles: readonly string[] = []): Set<string> {
  // Let TypeScript apply the real config to a small isolated filesystem. This
  // exercises its glob semantics without installing or compiling sibling apps.
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'velclaw-tsconfig-')))
  t.after(() => rmSync(root, { recursive: true, force: true }))

  for (const filename of [...dashboardFiles, ...applicationFiles, ...generatedTypeFiles, ...extraFiles]) {
    const absolutePath = path.join(root, filename)
    mkdirSync(path.dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, 'export {}\n')
  }

  const config = ts.readConfigFile(configPath, ts.sys.readFile)
  assert.equal(config.error, undefined, 'the root TypeScript config must be readable')
  const project = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  assert.deepEqual(project.errors, [], 'the root TypeScript config must parse without diagnostics')

  return new Set(project.fileNames.map((filename) => path.relative(root, filename).split(path.sep).join('/')))
}

test('the root TypeScript project excludes the standalone dashboard config, sources, and declarations', (t) => {
  const files = rootProjectFiles(t)
  assert.ok(files.has('app/page.tsx'), 'the root application must still be discovered')
  for (const filename of dashboardFiles) {
    assert.equal(files.has(filename), false, `${filename} must remain outside the root TypeScript project`)
  }
})

test('excluding the standalone dashboard preserves root Next.js code and unit tests', (t) => {
  const files = rootProjectFiles(t)
  for (const filename of applicationFiles) {
    assert.ok(files.has(filename), `${filename} must remain in the root TypeScript project`)
  }
})

test('excluding the standalone dashboard preserves production and development Next.js generated types', (t) => {
  const files = rootProjectFiles(t)
  for (const filename of generatedTypeFiles) {
    assert.ok(files.has(filename), `${filename} must remain in the root TypeScript project`)
  }
})

// Isolate boundary cases so TypeScript's preference for .ts over a same-name
// .tsx file does not hide whether either path was excluded by the config.
for (const filename of boundaryFiles) {
  test(`the standalone dashboard exclusion keeps ${filename} in the root project`, (t) => {
    const files = rootProjectFiles(t, [filename])
    assert.ok(files.has(filename), `${filename} must not be excluded with the standalone dashboard`)
  })
}
