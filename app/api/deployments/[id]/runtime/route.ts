import { NextResponse } from 'next/server'
import { ensureDeployStore } from '@/lib/deploy/store'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 3 })

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Params) {
  const auth = request.headers.get('authorization')
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN

  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Deployment id is required' }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const status = typeof body.status === 'string' ? body.status : 'failed'
  const url = typeof body.url === 'string' ? body.url : null
  const logs = Array.isArray(body.logs) ? body.logs.filter((value: unknown): value is string => typeof value === 'string').slice(-500) : null
  const error = typeof body.error === 'string' ? body.error.slice(0, 4000) : null

  if (!['building', 'ready', 'failed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid deployment status' }, { status: 400 })
  }

  try {
    await ensureDeployStore()
    const rows = await sql`
      UPDATE velclaw_deployments
      SET
        status = ${status},
        url = COALESCE(${url}, url),
        logs = COALESCE(${logs ? JSON.stringify(logs) : null}::jsonb, logs),
        error = ${error},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, project_name, status, url, error, logs
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, deployment: rows[0] })
  } catch (err) {
    console.error('[deployments/runtime]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Runtime update failed' }, { status: 500 })
  }
}
