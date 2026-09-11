import postgres from 'postgres'
import { randomUUID } from 'node:crypto'
import { decrypt, encrypt } from '@/lib/crypto'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 5 })

export type DeploymentStatus = 'queued' | 'building' | 'ready' | 'failed' | 'cancelled'
export type DeploymentEnv = Record<string, string>

export type Deployment = {
  id: string
  userId: string
  projectName: string
  repoUrl: string
  branch: string
  commitSha: string | null
  status: DeploymentStatus
  url: string | null
  customDomain: string | null
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
      custom_domain text,
      env_json text,
      logs jsonb NOT NULL DEFAULT '[]'::jsonb,
      error text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS velclaw_github_webhook_deliveries (
      delivery_id text PRIMARY KEY,
      event text NOT NULL,
      received_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`ALTER TABLE velclaw_deployments ADD COLUMN IF NOT EXISTS user_id text`
  await sql`UPDATE velclaw_deployments SET user_id = 'legacy' WHERE user_id IS NULL`
  await sql`ALTER TABLE velclaw_deployments ALTER COLUMN user_id SET DEFAULT 'legacy'`
  await sql`ALTER TABLE velclaw_deployments ALTER COLUMN user_id SET NOT NULL`
  await sql`ALTER TABLE velclaw_deployments ADD COLUMN IF NOT EXISTS custom_domain text`
  await sql`ALTER TABLE velclaw_deployments ADD COLUMN IF NOT EXISTS env_json text`
  await sql`CREATE INDEX IF NOT EXISTS velclaw_deployments_user_created_idx ON velclaw_deployments (user_id, created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS velclaw_deployments_repo_branch_idx ON velclaw_deployments (repo_url, branch, created_at DESC)`
  await sql`CREATE INDEX IF NOT EXISTS velclaw_deployments_created_idx ON velclaw_deployments (created_at DESC)`
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS velclaw_deployments_custom_domain_idx ON velclaw_deployments (custom_domain) WHERE custom_domain IS NOT NULL`
  initialized = true
}

function normalizeEnv(value?: DeploymentEnv | null) {
  if (!value) return null
  const entries = Object.entries(value)
    .filter(([key, val]) => /^[A-Za-z_][A-Za-z0-9_]{0,127}$/.test(key) && typeof val === 'string' && !/[\r\n]/.test(val))
    .slice(0, 100)
  if (entries.length === 0) return null
  return Object.fromEntries(entries.map(([key, val]) => [key, val.slice(0, 8192)]))
}

function normalizeDomain(value?: string | null) {
  if (!value?.trim()) return null
  const domain = value.trim().toLowerCase().replace(/\.$/, '')
  if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) throw new Error('Invalid custom domain')
  return domain
}

function publicDeploymentColumns() {
  return sql`
    id, user_id as "userId", project_name as "projectName", repo_url as "repoUrl", branch,
    commit_sha as "commitSha", status, url, custom_domain as "customDomain", logs, error,
    created_at as "createdAt", updated_at as "updatedAt"
  `
}

export async function claimGithubWebhookDelivery(deliveryId: string, event: string) {
  await ensureDeployStore()
  if (!deliveryId) return true
  const rows = await sql`
    INSERT INTO velclaw_github_webhook_deliveries (delivery_id, event)
    VALUES (${deliveryId}, ${event || 'unknown'})
    ON CONFLICT (delivery_id) DO NOTHING
    RETURNING delivery_id
  `
  return rows.length === 1
}

export async function createDeployment(input: {
  userId: string
  projectName: string
  repoUrl: string
  branch: string
  commitSha?: string | null
  env?: DeploymentEnv | null
  customDomain?: string | null
}) {
  await ensureDeployStore()
  const id = randomUUID()
  const env = normalizeEnv(input.env)
  const customDomain = normalizeDomain(input.customDomain)
  const encryptedEnv = env ? encrypt(JSON.stringify(env)) : null
  const rows = await sql<Deployment[]>`
    INSERT INTO velclaw_deployments (id, user_id, project_name, repo_url, branch, commit_sha, status, url, custom_domain, env_json, logs)
    VALUES (${id}, ${input.userId}, ${input.projectName}, ${input.repoUrl}, ${input.branch}, ${input.commitSha || null}, 'queued', NULL, ${customDomain}, ${encryptedEnv}, ${JSON.stringify(['Deployment queued'])}::jsonb)
    RETURNING ${publicDeploymentColumns()}
  `
  return rows[0]
}

export async function listDeployments(userId: string, limit = 50) {
  await ensureDeployStore()
  return sql<Deployment[]>`
    SELECT ${publicDeploymentColumns()}
    FROM velclaw_deployments WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${Math.min(Math.max(limit, 1), 100)}
  `
}

export async function getDeployment(id: string, userId: string) {
  await ensureDeployStore()
  const rows = await sql<Deployment[]>`
    SELECT ${publicDeploymentColumns()}
    FROM velclaw_deployments WHERE id = ${id} AND user_id = ${userId} LIMIT 1
  `
  return rows[0] || null
}

export async function findLatestDeploymentForWebhook(repoUrl: string, branch: string) {
  await ensureDeployStore()
  const normalized = repoUrl.trim().replace(/\/$/, '').replace(/\.git$/i, '')
  const rows = await sql<Deployment[]>`
    SELECT ${publicDeploymentColumns()}
    FROM velclaw_deployments
    WHERE regexp_replace(regexp_replace(rtrim(repo_url, '/'), '[.]git$', '', 'i'), '/$', '') = ${normalized}
      AND branch = ${branch}
    ORDER BY created_at DESC
    LIMIT 1
  `
  return rows[0] || null
}

export async function getWebhookDeploymentConfig(repoUrl: string, branch: string) {
  await ensureDeployStore()
  const normalized = repoUrl.trim().replace(/\/$/, '').replace(/\.git$/i, '')
  const rows = await sql`
    SELECT ${publicDeploymentColumns()}, env_json as "envJson"
    FROM velclaw_deployments
    WHERE regexp_replace(regexp_replace(rtrim(repo_url, '/'), '[.]git$', '', 'i'), '/$', '') = ${normalized}
      AND branch = ${branch}
    ORDER BY created_at DESC
    LIMIT 1
  `
  const row = rows[0] as (Deployment & { envJson: string | null }) | undefined
  if (!row) return null
  let env: DeploymentEnv = {}
  if (row.envJson) env = JSON.parse(decrypt(row.envJson)) as DeploymentEnv
  const { envJson: _envJson, ...deployment } = row
  return { deployment, env }
}

export async function claimNextDeployment() {
  await ensureDeployStore()
  const rows = await sql`
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
      d.commit_sha as "commitSha", d.status, d.url, d.custom_domain as "customDomain", d.env_json as "envJson", d.logs,
      d.error, d.created_at as "createdAt", d.updated_at as "updatedAt"
  `
  const job = rows[0] as (Deployment & { envJson: string | null }) | undefined
  if (!job) return null
  let env: DeploymentEnv = {}
  if (job.envJson) {
    try {
      const parsed = JSON.parse(decrypt(job.envJson))
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) env = parsed as DeploymentEnv
    } catch (error) {
      await finishDeployment(job.id, { status: 'failed', logs: [...(job.logs || []), 'ERROR: Unable to decrypt deployment environment'], error: error instanceof Error ? error.message : 'Environment decryption failed' })
      return null
    }
  }
  const { envJson: _envJson, ...safeJob } = job
  return { ...safeJob, env }
}

export async function finishDeployment(
  id: string,
  input: { status: 'ready' | 'failed'; logs: string[]; error?: string | null; url?: string | null },
) {
  await ensureDeployStore()
  await sql`
    UPDATE velclaw_deployments
    SET status = ${input.status}, logs = ${JSON.stringify(input.logs.slice(-500))}::jsonb,
        error = ${input.error || null}, url = COALESCE(${input.url || null}, url), updated_at = now()
    WHERE id = ${id}
  `
}

export async function closeDeployStore() {
  await sql.end({ timeout: 1 })
}
