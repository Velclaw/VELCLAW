import { NextResponse } from 'next/server'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 3 })

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN

  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows = await sql`
      WITH next_deployment AS (
        SELECT id
        FROM velclaw_deployments
        WHERE status = 'queued'
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE velclaw_deployments AS d
      SET status = 'building', updated_at = NOW()
      FROM next_deployment AS n
      WHERE d.id = n.id
      RETURNING d.id, d.project_name, d.github_url, d.branch, d.status, d.image
    `

    return NextResponse.json({ deployment: rows[0] ?? null })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to claim deployment' },
      { status: 500 },
    )
  }
}
