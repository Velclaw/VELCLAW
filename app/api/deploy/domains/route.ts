import { NextResponse } from 'next/server'
import postgres from 'postgres'
import { isVelclawHostname } from '@/lib/velclaw/product-domain'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 3 })

function authorized(request: Request) {
  const token = process.env.VELCLAW_DEPLOY_API_TOKEN
  const provided = request.headers.get('x-velclaw-admin-token') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return Boolean(token && provided === token)
}

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS velclaw_deploy_domains (
      hostname text PRIMARY KEY,
      deployment_id text NOT NULL REFERENCES velclaw_deployments(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!process.env.POSTGRES_URL) return NextResponse.json({ error: 'POSTGRES_URL is not configured' }, { status: 503 })
  await ensureTable()
  return NextResponse.json({ domains: await sql`SELECT hostname, deployment_id as "deploymentId", created_at as "createdAt" FROM velclaw_deploy_domains ORDER BY created_at DESC` })
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!process.env.POSTGRES_URL) return NextResponse.json({ error: 'POSTGRES_URL is not configured' }, { status: 503 })
  const input = await request.json().catch(() => null)
  const hostname = typeof input?.hostname === 'string' ? input.hostname.trim().toLowerCase() : ''
  const deploymentId = typeof input?.deploymentId === 'string' ? input.deploymentId : ''
  if (!isVelclawHostname(hostname))
    return NextResponse.json({ error: 'Only Velclaw first-party .cfd hostnames are supported' }, { status: 400 })
  await ensureTable()
  const [deployment] = await sql`SELECT id, status, url FROM velclaw_deployments WHERE id = ${deploymentId} LIMIT 1`
  if (!deployment) return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
  if (deployment.status !== 'ready') return NextResponse.json({ error: 'Only ready deployments can receive domains' }, { status: 409 })
  await sql`INSERT INTO velclaw_deploy_domains (hostname, deployment_id) VALUES (${hostname}, ${deploymentId}) ON CONFLICT (hostname) DO UPDATE SET deployment_id = EXCLUDED.deployment_id`
  return NextResponse.json({ ok: true, hostname, deploymentId })
}
