import postgres from 'postgres'
import { randomUUID } from 'node:crypto'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 5 })

export type DeploymentStatus = 'queued' | 'building' | 'ready' | 'failed' | 'cancelled'

export type Deployment = {
  id: string
  userId: string
  projectName: string
  repoUrl: string
  branch: string
  commitSha: string | null
  status: DeploymentStatus
  url: string | null
  logs: string[]
  error: string | null
  createdAt: string
  updatedAt: string
}

let initialized = false

export async function ensureDeployStore() {
  if (initialized) return
  if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL environment variable is required')
  await sql`
    CREATE TABLE IF NOT EXISTS velclaw_deployments (
      id text PRIMARY KEY,
      user_id text NOT NULL DEFAULT 'legacy',
      project_name text NOT NULL,
      repo_url text NOT NULL,
      branch text NOT NULL DEFAULT 'main',
      commit_sha text,
      status text NOT NULL DEFAULT 'queued',
      url text,
      logs jsonb NOT NULL DEFAULT '[]'::jsonb,
      error text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`ALTER TABLE velclaw_deployments ADD COLUMN IF NOT EXISTS user_id text`
  await sql`UPDATE velclaw_deployments SET user_id = 'legacy' WHERE user_id IS NULL`
  await sql`ALTER TABLE velclaw_deployments ALTER COLUMN user_id SET DEFAULT 'legacy'`
  await sql`ALTER TABLE velclaw_deployments ALTER COLUMN user_id SET NOT NULL`
  await sql`CREATE INDEX IF NOT EXISTS velclaw_deployments_user_created_idx ON velclaw_deployments (user_id, created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS velclaw_deployments_repo_branch_idx ON velclaw_deployments (repo_url, branch, created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS velclaw_deployments_created_idx ON velclaw_deployments (created_at DESC)`
  initialized = true
}

export async function createDeployment(input: {
  userId: string
  projectName: string
  repoUrl: string
  branch: string
  commitSha?: string | null
}) {
  await ensureDeployStore()
  const id = randomUUID()
  const rows = await sql<Deployment[]>`
    INSERT INTO velclaw_deployments (id, user_id, project_name, repo_url, branch, commit_sha, status, logs)
    VALUES (${id}, ${input.userId}, ${input.projectName}, ${input.repoUrl}, ${input.branch}, ${input.commitSha || null}, 'queued', ${JSON.stringify(['Deployment queued'])}::jsonb)
    RETURNING id, user_id as "userId", project_name as "projectName", repo_url as "repoUrl", branch, commit_sha as "commitSha", status,
      url, logs, error, created_at as "createdAt", updated_at as "updatedAt"
  `
  return rows[0]
}

export async function listDeployments(userId: string, limit = 50) {
  await ensureDeployStore()
  return sql<Deployment[]>`
    SELECT id, user_id as "userId", project_name as "projectName", repo_url as "repoUrl", branch, commit_sha as "commitSha", status,
      url, logs, error, created_at as "createdAt", updated_at as "updatedAt"
    FROM velclaw_deployments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}
  `
}

export async function getDeployment(id: string, userId: string) {
  await ensureDeployStore()
  const rows = await sql<Deployment[]>`
    SELECT id, user_id as "userId", project_name as "projectName", repo_url as "repoUrl", branch, commit_sha as "commitSha", status,
      url, logs, error, created_at as "createdAt", updated_at as "updatedAt"
    FROM velclaw_deployments WHERE id = ${id} AND user_id = ${userId} LIMIT 1
  `
  return rows[0] || null
}

export async function findLatestDeploymentForWebhook(repoUrl: string, branch: string) {
  await ensureDeployStore()
  const normalized = repoUrl.trim().replace(/\/$/, '').replace(/\.git$/i, '')
  const rows = await sql<Deployment[]>`
    SELECT id, user_id as "userId", project_name as "projectName", repo_url as "repoUrl", branch, commit_sha as "commitSha", status,
      url, logs, error, created_at as "createdAt", updated_at as "updatedAt"
    FROM velclaw_deployments
    WHERE regexp_replace(regexp_replace(rtrim(repo_url, '/'), '\\.git$', '', 'i'), '/$', '') = ${normalized}
      AND branch = ${branch}
    ORDER BY created_at DESC
    LIMIT 1
  `
  return rows[0] || null
}

export async function claimNextDeployment() {
  await ensureDeployStore()
  const rows = await sql<Deployment[]>`
    WITH next_job AS (
      SELECT id FROM velclaw_deployments
      WHERE status = 'queued'
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE velclaw_deployments d
    SET status = 'building', updated_at = now(),
        logs = d.logs || '["Build worker claimed deployment"]'::jsonb
    FROM next_job
    WHERE d.id = next_job.id
    RETURNING d.id, d.user_id as "userId", d.project_name as "projectName", d.repo_url as "repoUrl", d.branch,
      d.commit_sha as "commitSha", d.status, d.url, d.logs, d.error,
      d.created_at as "createdAt", d.updated_at as "updatedAt"
  `
  return rows[0] || null
}

export async function finishDeployment(
  id: string,
  input: { status: 'ready' | 'failed'; logs: string[]; error?: string | null; url?: string | null },
) {
  await ensureDeployStore()
  await sql`
    UPDATE velclaw_deployments
    SET status = ${input.status}, logs = ${JSON.stringify(input.logs)}::jsonb,
        error = ${input.error || null}, url = ${input.url || null}, updated_at = now()
    WHERE id = ${id}
  `
}

export async function closeDeployStore() {
  await sql.end({ timeout: 1 })
}
