import { NextRequest, NextResponse } from 'next/server'
import { Sandbox } from '@vercel/sandbox'
import { getServerSession } from '@/lib/session/get-server-session'
import { getUserGitHubToken } from '@/lib/github/user-token'
import { createAuthenticatedRepoUrl } from '@/lib/sandbox/config'
import { runCommandInSandbox, runInProject, PROJECT_DIR } from '@/lib/sandbox/commands'
import { registerSandbox } from '@/lib/sandbox/sandbox-registry'
import { generateId } from '@/lib/utils/id'

const PACKAGE_NAME = /^(?:@[^/\s]+\/)?[a-zA-Z0-9._~-]+$/
const VERSION = /^[0-9A-Za-z*^~<>=.|+\-\s]+$/
const REPO_URL = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?(?:\/)?$/

function packageSpec(name: string, version?: string) {
  return version ? `${name}@${version}` : name
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const version = typeof body?.version === 'string' ? body.version.trim() : ''
  const repoUrl = typeof body?.repoUrl === 'string' ? body.repoUrl.trim() : ''

  if (!PACKAGE_NAME.test(name)) return NextResponse.json({ error: 'Invalid package name' }, { status: 400 })
  if (version && !VERSION.test(version)) return NextResponse.json({ error: 'Invalid package version' }, { status: 400 })
  if (!REPO_URL.test(repoUrl)) return NextResponse.json({ error: 'A GitHub repository URL is required' }, { status: 400 })

  const taskId = generateId(12)
  const githubToken = await getUserGitHubToken()
  const authenticatedRepoUrl = createAuthenticatedRepoUrl(repoUrl, githubToken)

  try {
    const sandbox = await Sandbox.create({
      teamId: process.env.SANDBOX_VERCEL_TEAM_ID!,
      projectId: process.env.SANDBOX_VERCEL_PROJECT_ID!,
      token: process.env.SANDBOX_VERCEL_TOKEN!,
      timeout: 30 * 60 * 1000,
      ports: [],
      runtime: 'node22',
      resources: { vcpus: 2 },
    })

    registerSandbox(taskId, sandbox, true)

    const mkdir = await runCommandInSandbox(sandbox, 'mkdir', ['-p', PROJECT_DIR])
    if (!mkdir.success) throw new Error('Failed to create sandbox project directory')

    const clone = await runCommandInSandbox(sandbox, 'git', ['clone', '--depth', '1', authenticatedRepoUrl, PROJECT_DIR])
    if (!clone.success) throw new Error('Failed to clone the GitHub repository')

    const packageJson = await runInProject(sandbox, 'test', ['-f', 'package.json'])
    if (!packageJson.success) throw new Error('The selected repository does not contain package.json')

    const pnpm = await runInProject(sandbox, 'test', ['-f', 'pnpm-lock.yaml'])
    const yarn = await runInProject(sandbox, 'test', ['-f', 'yarn.lock'])

    let manager: 'pnpm' | 'yarn' | 'npm' = 'npm'
    if (pnpm.success) manager = 'pnpm'
    else if (yarn.success) manager = 'yarn'

    const spec = packageSpec(name, version || undefined)
    const command = manager === 'pnpm' ? 'pnpm' : manager === 'yarn' ? 'yarn' : 'npm'
    const args = manager === 'pnpm'
      ? ['add', '--ignore-scripts', spec]
      : manager === 'yarn'
        ? ['add', '--ignore-scripts', spec]
        : ['install', '--ignore-scripts', '--no-audit', '--no-fund', spec]

    const install = await runInProject(sandbox, command, args)
    if (!install.success) {
      return NextResponse.json({
        error: 'Library installation failed',
        sandboxId: sandbox.sandboxId,
        package: spec,
        packageManager: manager,
        details: install.error || install.output || 'unknown installer error',
      }, { status: 422 })
    }

    const manifest = await runInProject(sandbox, 'cat', ['package.json'])
    const lockFile = manager === 'pnpm' ? 'pnpm-lock.yaml' : manager === 'yarn' ? 'yarn.lock' : 'package-lock.json'
    const lock = await runInProject(sandbox, 'test', ['-f', lockFile])

    return NextResponse.json({
      ok: true,
      sandboxId: sandbox.sandboxId,
      taskId,
      package: spec,
      packageManager: manager,
      projectPath: PROJECT_DIR,
      lockfile: lock.success ? lockFile : null,
      packageJson: manifest.success ? JSON.parse(manifest.output || '{}') : null,
      note: 'Installed inside an isolated Velclaw sandbox with lifecycle scripts disabled. The sandbox is kept alive for the current workspace session.',
    })
  } catch (error) {
    console.error('Library installation failed:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Library installation failed' }, { status: 500 })
  }
}
