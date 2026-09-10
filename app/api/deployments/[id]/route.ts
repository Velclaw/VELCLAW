import { NextResponse } from 'next/server'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 3 })

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Params) {
  const token = request.headers.get('x-velclaw-admin-token')
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN

  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Deployment id is required' }, { status: 400 })

  try {
    const result = await sql.begin(async (tx) => {
      const currentRows = await tx.unsafe(
        `SELECT id, project_name, status, image
         FROM velclaw_deployments
         WHERE id = $1
         FOR UPDATE`,
        [id],
      )

      if (currentRows.length === 0) return { error: 'Deployment not found', httpStatus: 404 } as const
      const current = currentRows[0] as unknown as { id: string; project_name: string }

      const previousRows = await tx.unsafe(
        `SELECT id, image
         FROM velclaw_deployments
         WHERE project_name = $1
           AND status = 'ready'
           AND id <> $2
           AND image IS NOT NULL
         ORDER BY created_at DESC
         LIMIT 1
         FOR UPDATE`,
        [current.project_name, id],
      )

      if (previousRows.length === 0) {
        return { error: 'No previous ready deployment is available for rollback', httpStatus: 409 } as const
      }

      const previous = previousRows[0] as unknown as { id: string; image: string }
      await tx.unsafe(
        `UPDATE velclaw_deployments
         SET status = 'queued',
             error = NULL,
             logs = COALESCE(logs, '') || $1,
             updated_at = NOW()
         WHERE id = $2`,
        [`\nRollback requested from deployment ${previous.id}`, id],
      )

      return {
        ok: true,
        action: 'rollback',
        project_name: current.project_name,
        from_deployment: id,
        target_deployment: previous.id,
        image: previous.image,
        status: 'queued' as const,
      }
    })

    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.httpStatus })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Rollback failed' }, { status: 500 })
  }
}
