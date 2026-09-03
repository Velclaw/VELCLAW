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
    const deployment = await sql.begin(async (tx) => {
      const rows = await tx`
        SELECT
          id,
          project_name,
          github_url,
          branch,
          status,
          image
        FROM velclaw_deployments
        WHERE status = 'queued'
        ORDER BY created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      `

      if (rows.length === 0) return null

      const current = rows[0]
      await tx`
        UPDATE velclaw_deployments
        SET status = 'building', updated_at = NOW()
        WHERE id = ${current.id}
      `

      return current
    })

    return NextResponse.json({ deployment })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to claim deployment' },
      { status: 500 },
    )
  }
}
