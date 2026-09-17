import { NextResponse } from 'next/server'
import postgres from 'postgres'
import { claimNextDeployment } from '@/lib/deploy/store'

export const dynamic = 'force-dynamic'
const sql = postgres(process.env.POSTGRES_URL || '', { max: 2 })

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN
  if (!expected || auth !== `Bearer ${expected}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL environment variable is required')
    await sql`
      UPDATE velclaw_deployments
      SET status = 'queued', updated_at = NOW(),
          logs = logs || '["Recovered stale deployment after worker timeout"]'::jsonb,
          error = NULL
      WHERE status = 'building'
        AND updated_at < NOW() - INTERVAL '20 minutes'
    `
    const deployment = await claimNextDeployment()
    return NextResponse.json({ deployment })
  } catch (error) {
    console.error('[deployments/claim]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to claim deployment' }, { status: 500 })
  }
}
