import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test, { type TestContext } from 'node:test'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = fileURLToPath(new URL('..', import.meta.url))
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile)
assert.equal(config.error, undefined, 'the root TypeScript configuration must be readable')

function project(t: TestContext, sources: Record<string, string>) {
  const directory = mkdtempSync(path.join(tmpdir(), 'velclaw-tsconfig-scope-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))

  for (const [file, contents] of Object.entries({
    'app/page.tsx': 'export default function Page() { return null }',
    ...sources,
  })) {
    const destination = path.join(directory, file)
    mkdirSync(path.dirname(destination), { recursive: true })
    writeFileSync(destination, contents)
  }

  // Let TypeScript apply the real include/exclude globs to isolated files.
  // No application dependencies, builds, or checkout mutations are needed.
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, directory)
  assert.deepEqual(parsed.errors, [])

  return {
    files: parsed.fileNames.map((file) => path.relative(directory, file).split(path.sep).join('/')).sort(),
    diagnostics() {
      const program = ts.createProgram(parsed.fileNames, {
        ...parsed.options,
        // Keep ambient types independent of the host and avoid build cache state.
        types: [],
        incremental: false,
      })
      return ts.getPreEmitDiagnostics(program)
    },
  }
}

test('the dashboard Vite config and router imports cannot break the root TypeScript project', (t) => {
  const sources = Object.fromEntries(
    ['dashboard-skeleton/vite.config.ts', 'dashboard-skeleton/src/App.tsx'].map((file) => [
      file,
      readFileSync(path.join(root, file), 'utf8'),
    ]),
  )
  const fixture = project(t, sources)

  assert.deepEqual(fixture.files, ['app/page.tsx'])
  assert.deepEqual(fixture.diagnostics(), [])
})

test('dashboard exclusion covers direct files, deeply nested sources, and declarations', (t) => {
  const sources = Object.fromEntries(
    [
      'dashboard-skeleton/config.ts',
      'dashboard-skeleton/Widget.tsx',
      'dashboard-skeleton/src/pages/Dashboard.tsx',
      'dashboard-skeleton/src/features/settings/helpers/options.ts',
      'dashboard-skeleton/src/types/vite-env.d.ts',
    ].map((file) => [file, 'export {}']),
  )

  assert.deepEqual(project(t, sources).files, ['app/page.tsx'])
})

test('root application sources and generated Next.js types remain included', (t) => {
  const included = [
    'next-env.d.ts',
    'next.config.ts',
    'app/api/health/route.ts',
    'components/dashboard.tsx',
    'lib/dashboard.ts',
    'tests/example.test.ts',
    '.next/types/app/page.ts',
    '.next/dev/types/routes.d.ts',
  ]
  const sources = Object.fromEntries(included.map((file) => [file, 'export {}']))

  assert.deepEqual(project(t, sources).files, ['app/page.tsx', ...included].sort())
})

test('dashboard exclusion is limited to the root standalone directory', (t) => {
  const included = [
    'dashboard-skeleton-helper.ts',
    'dashboard-skeleton-copy/src/App.tsx',
    'app/dashboard-skeleton/page.tsx',
    'components/dashboard-skeleton/Widget.tsx',
  ]
  const sources = Object.fromEntries(included.map((file) => [file, 'export {}']))
  sources['dashboard-skeleton/src/App.tsx'] = 'export {}'

  assert.deepEqual(project(t, sources).files, ['app/page.tsx', ...included].sort())
})

test('excluding the standalone dashboard still reports type errors in the root application', (t) => {
  const fixture = project(t, {
    'app/api/health/route.ts': 'export const status: string = 200',
    'dashboard-skeleton/src/broken.ts': 'export const ignored: string = 200',
  })
  const diagnostics = fixture.diagnostics()

  assert.equal(diagnostics.length, 1)
  assert.equal(diagnostics[0].code, 2322)
  assert.ok(diagnostics[0].file?.fileName.endsWith('/app/api/health/route.ts'))
})
