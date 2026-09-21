import { NextResponse } from 'next/server'
import { ensureDeployStore } from '@/lib/deploy/store'
import postgres from 'postgres'
import { isVelclawProductUrl } from '@/lib/velclaw/product-domain'

export const dynamic = 'force-dynamic'
const sql = postgres(process.env.POSTGRES_URL || '', { max: 3 })

type Params = { params: Promise<{ id: string }> }
const STATUS = new Set(['building', 'ready', 'failed'])

export async function POST(request: Request, { params }: Params) {
  const auth = request.headers.get('authorization')
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN
  if (!expected || auth !== `Bearer ${expected}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid deployment id' }, { status: 400 })

  const body = await request.json().catch(() => null)
  const status = typeof body?.status === 'string' ? body.status : ''
  const url = typeof body?.url === 'string' ? body.url.trim() : null
  const logs = Array.isArray(body?.logs) ? body.logs.filter((v: unknown): v is string => typeof v === 'string').slice(-500) : null
  const error = typeof body?.error === 'string' ? body.error.slice(0, 4000) : null
  if (!STATUS.has(status)) return NextResponse.json({ error: 'Invalid deployment status' }, { status: 400 })
  if (url && !isVelclawProductUrl(url)) return NextResponse.json({ error: 'Runtime URL must remain inside the Velclaw .com/.ai/.dev/.io/.app product domains' }, { status: 400 })
  if (status === 'ready' && !url) return NextResponse.json({ error: 'A ready deployment requires a verified product URL' }, { status: 400 })

  try {
    await ensureDeployStore()
    const rows = await sql`
      UPDATE velclaw_deployments
      SET status = ${status}, url = COALESCE(${url}, url),
          logs = COALESCE(${logs ? JSON.stringify(logs) : null}::jsonb, logs),
          error = ${status === 'failed' ? error : null}, updated_at = NOW()
      WHERE id = ${id} AND status IN ('queued', 'building')
      RETURNING id, project_name, status, url, error, logs
    `
    if (!rows.length) {
      const existing = await sql`SELECT id, status FROM velclaw_deployments WHERE id = ${id} LIMIT 1`
      if (!existing.length) return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
      return NextResponse.json({ error: 'Deployment is already finalized' }, { status: 409 })
    }
    return NextResponse.json({ ok: true, deployment: rows[0] })
  } catch (err) {
    console.error('[deployments/runtime]', err)
    return NextResponse.json({ error: 'Runtime update failed' }, { status: 500 })
  }
}
