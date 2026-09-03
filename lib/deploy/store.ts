import postgres from 'postgres'
import { randomUUID } from 'node:crypto'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 5 })

export type DeploymentStatus = 'queued' | 'building' | 'ready' | 'failed' | 'cancelled'

export type Deployment = {
  id: string
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
  await sql`CREATE INDEX IF NOT EXISTS velclaw_deployments_created_idx ON velclaw_deployments (created_at DESC)`
  initialized = true
}

export async function createDeployment(input: { projectName: string; repoUrl: string; branch: string; commitSha?: string | null }) {
  await ensureDeployStore()
  const id = randomUUID()
  const rows = await sql<Deployment[]>`
    INSERT INTO velclaw_deployments (id, project_name, repo_url, branch, commit_sha, status, logs)
    VALUES (${id}, ${input.projectName}, ${input.repoUrl}, ${input.branch}, ${input.commitSha || null}, 'queued', ${JSON.stringify(['Deployment queued'])}::jsonb)
    RETURNING id, project_name as "projectName", repo_url as "repoUrl", branch, commit_sha as "commitSha", status,
      url, logs, error, created_at as "createdAt", updated_at as "updatedAt"
  `
  return rows[0]
}

export async function listDeployments(limit = 50) {
  await ensureDeployStore()
  return sql<Deployment[]>`
    SELECT id, project_name as "projectName", repo_url as "repoUrl", branch, commit_sha as "commitSha", status,
      url, logs, error, created_at as "createdAt", updated_at as "updatedAt"
    FROM velclaw_deployments ORDER BY created_at DESC LIMIT ${limit}
  `
}

export async function getDeployment(id: string) {
  await ensureDeployStore()
  const rows = await sql<Deployment[]>`
    SELECT id, project_name as "projectName", repo_url as "repoUrl", branch, commit_sha as "commitSha", status,
      url, logs, error, created_at as "createdAt", updated_at as "updatedAt"
    FROM velclaw_deployments WHERE id = ${id} LIMIT 1
  `
  return rows[0] || null
}

export async function closeDeployStore() {
  await sql.end({ timeout: 1 })
}
