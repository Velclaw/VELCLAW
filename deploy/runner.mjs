import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { promisify } from 'node:util'
import path from 'node:path'
import postgres from 'postgres'

const exec = promisify(execFile)
const sql = postgres(process.env.POSTGRES_URL || '', { max: 2 })
const POLL_MS = Number(process.env.VELCLAW_DEPLOY_POLL_MS || 3000)
const WORK_ROOT = process.env.VELCLAW_DEPLOY_WORKDIR || path.join(tmpdir(), 'velclaw-deploy')
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

function validateRepo(repoUrl) {
  const url = new URL(repoUrl)
  if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'github.com') {
    throw new Error('Only HTTPS github.com repositories are supported')
  }
}

async function ensureStore() {
  await sql`
    CREATE TABLE IF NOT EXISTS velclaw_deployments (
      id text PRIMARY KEY, project_name text NOT NULL, repo_url text NOT NULL,
      branch text NOT NULL DEFAULT 'main', commit_sha text, status text NOT NULL DEFAULT 'queued',
      url text, logs jsonb NOT NULL DEFAULT '[]'::jsonb, error text,
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
}

async function claim() {
  const rows = await sql`
    WITH next_job AS (
      SELECT id FROM velclaw_deployments WHERE status = 'queued'
      ORDER BY created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1
    )
    UPDATE velclaw_deployments d SET status='building', updated_at=now(),
      logs=d.logs || '["Build worker claimed deployment"]'::jsonb
    FROM next_job WHERE d.id=next_job.id
    RETURNING d.id, d.project_name as "projectName", d.repo_url as "repoUrl", d.branch,
      d.commit_sha as "commitSha", d.logs
  `
  return rows[0]
}

async function finish(id, status, logs, error = null) {
  await sql`
    UPDATE velclaw_deployments SET status=${status}, logs=${JSON.stringify(logs)}::jsonb,
      error=${error}, updated_at=now() WHERE id=${id}
  `
}

async function run(job) {
  const dir = await mkdtemp(path.join(WORK_ROOT, `${job.id}-`))
  const logs = Array.isArray(job.logs) ? [...job.logs] : []
  try {
    validateRepo(job.repoUrl)
    const cloneArgs = ['clone', '--depth', '1', '--branch', job.branch]
    if (GITHUB_TOKEN) {
      const auth = Buffer.from(`x-access-token:${GITHUB_TOKEN}`).toString('base64')
      cloneArgs.push('-c', `http.extraheader=AUTHORIZATION: basic ${auth}`)
    }
    cloneArgs.push(job.repoUrl, dir)
    await exec('git', cloneArgs, {
      env: process.env,
      timeout: 120_000,
      maxBuffer: 2 * 1024 * 1024,
    })
    logs.push(`Source cloned: ${job.repoUrl}#${job.branch}`)

    const packageManager = process.env.VELCLAW_DEPLOY_PACKAGE_MANAGER || 'pnpm'
    const installArgs = packageManager === 'npm' ? ['install', '--ignore-scripts'] : ['install', '--frozen-lockfile']
    await exec(packageManager, installArgs, { cwd: dir, env: process.env, timeout: 600_000, maxBuffer: 4 * 1024 * 1024 })
    logs.push(`Dependencies installed with ${packageManager}`)

    const buildArgs = packageManager === 'npm' ? ['run', 'build'] : ['build']
    await exec(packageManager, buildArgs, { cwd: dir, env: process.env, timeout: 900_000, maxBuffer: 8 * 1024 * 1024 })
    logs.push('Production build completed')

    const manifest = {
      deploymentId: job.id,
      project: job.projectName,
      repository: job.repoUrl,
      branch: job.branch,
      builtAt: new Date().toISOString(),
      runtime: 'nextjs',
      status: 'ready-for-runtime',
    }
    await writeFile(path.join(dir, 'velclaw-deployment.json'), JSON.stringify(manifest, null, 2))
    logs.push('Deployment artifact manifest written')
    await finish(job.id, 'ready', logs)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logs.push(`Build failed: ${message}`)
    await finish(job.id, 'failed', logs, message.slice(0, 4000))
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => undefined)
  }
}

async function main() {
  if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL environment variable is required')
  await ensureStore()
  await exec('mkdir', ['-p', WORK_ROOT])
  console.log('[velclaw-deploy] build worker online')
  for (;;) {
    const job = await claim()
    if (job) await run(job)
    else await new Promise(resolve => setTimeout(resolve, POLL_MS))
  }
}

main().catch(error => {
  console.error('[velclaw-deploy] fatal:', error)
  process.exit(1)
})
