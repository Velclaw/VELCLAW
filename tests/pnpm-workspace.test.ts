import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test, { type TestContext } from 'node:test'
import { fileURLToPath } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url))

type WorkspaceProject = { name: string; path: string }

function workspace(t: TestContext) {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'velclaw-pnpm-workspace-')))
  t.after(() => rmSync(root, { recursive: true, force: true }))

  // Exercise pnpm's interpretation of the real configuration without installing
  // dependencies, consulting the registry, or depending on existing node_modules.
  copyFileSync(path.join(repositoryRoot, 'pnpm-workspace.yaml'), path.join(root, 'pnpm-workspace.yaml'))
  for (const directory of ['.', 'AgentsIDE']) {
    mkdirSync(path.join(root, directory), { recursive: true })
    copyFileSync(path.join(repositoryRoot, directory, 'package.json'), path.join(root, directory, 'package.json'))
  }

  return {
    root,
    addPackage(directory: string, name: string) {
      const destination = path.join(root, directory)
      mkdirSync(destination, { recursive: true })
      writeFileSync(path.join(destination, 'package.json'), JSON.stringify({ name, version: '1.0.0', private: true }))
    },
    list(directory = '.', filter?: string): WorkspaceProject[] {
      const result = spawnSync(
        'pnpm',
        [
          '--recursive',
          ...(filter ? ['--filter', filter, '--fail-if-no-match'] : []),
          'list',
          '--depth',
          '-1',
          '--json',
        ],
        {
          cwd: path.join(root, directory),
          encoding: 'utf8',
          timeout: 10_000,
          env: { ...process.env, CI: 'true', COREPACK_ENABLE_NETWORK: '0' },
        },
      )
      assert.ifError(result.error)
      assert.equal(result.signal, null)
      assert.equal(result.status, 0, result.stderr || result.stdout)
      return JSON.parse(result.stdout)
    },
  }
}

function projectDirectories(root: string, projects: WorkspaceProject[]) {
  return projects.map((project) => path.relative(root, project.path) || '.').sort()
}

for (const directory of ['.', 'AgentsIDE']) {
  test(`pnpm discovers the root and AgentsIDE packages when invoked from ${directory}`, (t) => {
    const project = workspace(t)
    const packages = project.list(directory)

    assert.deepEqual(projectDirectories(project.root, packages), ['.', 'AgentsIDE'])
    assert.equal(packages.find((entry) => entry.path === path.join(project.root, 'AgentsIDE'))?.name, 'agentside')
  })
}

for (const filter of ['agentside', './AgentsIDE']) {
  test(`pnpm can select AgentsIDE alone using the ${filter} filter`, (t) => {
    const project = workspace(t)
    assert.deepEqual(projectDirectories(project.root, project.list('.', filter)), ['AgentsIDE'])
  })
}

test('registering AgentsIDE does not include sibling, similarly named, or nested packages', (t) => {
  const project = workspace(t)
  project.addPackage('Autoship', 'autoship')
  project.addPackage('AgentsIDE-copy', 'agentside-copy')
  project.addPackage('AgentsIDE/examples/demo', 'agentside-example')

  assert.deepEqual(projectDirectories(project.root, project.list()), ['.', 'AgentsIDE'])
})
