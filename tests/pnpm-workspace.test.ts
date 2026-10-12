import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { realpathSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = realpathSync(fileURLToPath(new URL('..', import.meta.url)))
const agentsideRoot = path.join(root, 'AgentsIDE')

type WorkspaceProject = { name: string; path: string }

function listProjects(cwd: string, filter?: string): WorkspaceProject[] {
  // Exercise pnpm's workspace parser and discovery without installing packages,
  // accessing the registry, or depending on AgentsIDE's node_modules being present.
  const result = spawnSync(
    'pnpm',
    ['--recursive', ...(filter ? ['--filter', filter, '--fail-if-no-match'] : []), 'list', '--depth', '-1', '--json'],
    { cwd, encoding: 'utf8', timeout: 10_000, env: { ...process.env, CI: 'true' } },
  )
  assert.ifError(result.error)
  assert.equal(result.signal, null, 'workspace discovery must finish within its timeout')
  assert.equal(result.status, 0, result.stderr || result.stdout)

  const projects: WorkspaceProject[] = JSON.parse(result.stdout)
  assert.ok(Array.isArray(projects), 'pnpm must return a project list')
  return projects.map((project) => ({ name: project.name, path: realpathSync(project.path) }))
}

const expectedProjects = [
  { name: 'velclaw', path: root },
  { name: 'agentside', path: agentsideRoot },
]

for (const [label, cwd] of [
  ['repository root', root],
  ['AgentsIDE project root used by Vercel', agentsideRoot],
] as const) {
  test(`pnpm discovers AgentsIDE and retains the root package from the ${label}`, () => {
    const projects = listProjects(cwd)
    const byPath = (a: WorkspaceProject, b: WorkspaceProject) => a.path.localeCompare(b.path)
    // Exact membership also guards against a wildcard accidentally enrolling
    // unrelated nested applications in the workspace install.
    assert.deepEqual(projects.sort(byPath), [...expectedProjects].sort(byPath))
  })
}

test('AgentsIDE is addressable by package name from the repository root', () => {
  assert.deepEqual(listProjects(root, 'agentside'), [{ name: 'agentside', path: agentsideRoot }])
})

test('selecting the current Vercel project does not fall back to the root package', () => {
  assert.deepEqual(listProjects(agentsideRoot, '.'), [{ name: 'agentside', path: agentsideRoot }])
})
