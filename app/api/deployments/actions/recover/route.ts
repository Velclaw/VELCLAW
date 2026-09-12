import { NextResponse } from 'next/server'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'
const sql = postgres(process.env.POSTGRES_URL || '', { max: 2 })

export async function POST(request: Request) {
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN
  const provided = request.headers.get('authorization')
  if (!expected || provided !== `Bearer ${expected}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await sql`
      UPDATE velclaw_deployments
      SET status = 'queued', updated_at = NOW(),
          logs = logs || '["Recovered stale deployment after worker timeout"]'::jsonb,
          error = NULL
      WHERE status = 'building'
        AND updated_at < NOW() - INTERVAL '20 minutes'
      RETURNING id
    `
    return NextResponse.json({ recovered: rows.length, deploymentIds: rows.map((row) => row.id) })
  } catch (error) {
    console.error('[deployments/recover]', error)
    return NextResponse.json({ error: 'Deployment recovery failed' }, { status: 500 })
  }
}
