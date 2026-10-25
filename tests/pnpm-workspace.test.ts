import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync, realpathSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = realpathSync(fileURLToPath(new URL('..', import.meta.url)))
const agentsideRoot = path.join(root, 'AgentsIDE')

type WorkspaceProject = { name: string; path: string }

// Exercise pnpm's YAML parsing and workspace selection without an install,
// network access, lifecycle scripts, or reliance on existing node_modules.
function listProjects(cwd: string, filter?: string): WorkspaceProject[] {
  const result = spawnSync(
    'pnpm',
    [...(filter ? ['--filter', filter] : []), 'list', '--recursive', '--depth', '-1', '--json'],
    { cwd, encoding: 'utf8', timeout: 10_000, env: { ...process.env, CI: 'true' } },
  )
  assert.ifError(result.error)
  assert.equal(result.signal, null)
  assert.equal(result.status, 0, result.stderr)
  return JSON.parse(result.stdout)
}

for (const directory of ['.', 'AgentsIDE']) {
  test(`workspace discovery from ${directory} includes the root and AgentsIDE without pulling in sibling apps`, () => {
    const projects = listProjects(path.join(root, directory))
    // Exact membership also catches accidental broad globs and duplicate entries.
    assert.deepEqual(projects.map((project) => path.relative(root, project.path) || '.').sort(), ['.', 'AgentsIDE'])

    const agentside = projects.find((project) => project.path === agentsideRoot)
    assert.ok(agentside, 'AgentsIDE must be discovered with its case-sensitive directory name')
    assert.equal(agentside.name, 'agentside')

    // The selected package must expose its own build dependencies, which were
    // omitted when installs from AgentsIDE only discovered the root package.
    const manifest = JSON.parse(readFileSync(path.join(agentside.path, 'package.json'), 'utf8'))
    for (const dependency of ['vite', '@vitejs/plugin-react']) {
      assert.equal(typeof manifest.devDependencies?.[dependency], 'string')
      assert.ok(manifest.devDependencies[dependency].trim(), 'build dependencies must have a version specifier')
    }
  })
}

for (const [directory, filter] of [
  ['.', 'agentside'],
  ['AgentsIDE', 'agentside'],
  ['.', './AgentsIDE'],
]) {
  test(`filter ${filter} from ${directory} selects AgentsIDE without falling back to the root package`, () => {
    const projects = listProjects(path.join(root, directory), filter)
    assert.deepEqual(
      projects.map((project) => ({ name: project.name, path: project.path })),
      [{ name: 'agentside', path: agentsideRoot }],
    )
  })
}
