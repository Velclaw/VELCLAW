import { NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 3 })

function authorized(request: Request) {
  const configured = process.env.VELCLAW_DEPLOY_API_TOKEN
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return Boolean(configured && provided && provided === configured)
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!process.env.POSTGRES_URL) return NextResponse.json({ error: 'POSTGRES_URL is not configured' }, { status: 503 })
  const { id } = await context.params
  const input = await request.json().catch(() => null)
  const status = input?.status === 'ready' || input?.status === 'failed' ? input.status : null
  const url = typeof input?.url === 'string' ? input.url : null
  const error = typeof input?.error === 'string' ? input.error : null
  const logs = Array.isArray(input?.logs) ? input.logs.filter((item: unknown): item is string => typeof item === 'string').slice(-500) : []
  if (!status) return NextResponse.json({ error: 'Invalid runtime status' }, { status: 400 })
  await sql`
    UPDATE velclaw_deployments
    SET status = ${status}, url = ${url}, error = ${error}, logs = ${JSON.stringify(logs)}::jsonb, updated_at = now()
    WHERE id = ${id}
  `
  return NextResponse.json({ ok: true, id, status, url })
}
