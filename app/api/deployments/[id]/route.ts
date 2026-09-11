import { NextResponse } from 'next/server'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 3 })

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const token = request.headers.get('x-velclaw-admin-token')
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN
  if (!expected || token !== expected) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Deployment id is required' }, { status: 400 })

  try {
    const result = await sql.begin(async (tx) => {
      const currentRows = await tx`
        SELECT id, user_id, project_name, repo_url, branch, status
        FROM velclaw_deployments
        WHERE id = ${id}
        FOR UPDATE
      `
      if (currentRows.length === 0) return { error: 'Deployment not found', httpStatus: 404 } as const

      const current = currentRows[0] as {
        id: string
        user_id: string
        project_name: string
        repo_url: string
        branch: string
        status: string
      }

      const previousRows = await tx`
        SELECT id, commit_sha
        FROM velclaw_deployments
        WHERE user_id = ${current.user_id}
          AND project_name = ${current.project_name}
          AND repo_url = ${current.repo_url}
          AND branch = ${current.branch}
          AND status = 'ready'
          AND id <> ${id}
          AND commit_sha IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 1
        FOR UPDATE
      `
      if (previousRows.length === 0) {
        return { error: 'No previous ready deployment is available for rollback', httpStatus: 409 } as const
      }

      const previous = previousRows[0] as { id: string; commit_sha: string }
      await tx`
        UPDATE velclaw_deployments
        SET status = 'queued',
            commit_sha = ${previous.commit_sha},
            error = NULL,
            logs = logs || ${JSON.stringify([`Rollback queued to deployment ${previous.id} at ${previous.commit_sha}`])}::jsonb,
            updated_at = NOW()
        WHERE id = ${id}
      `

      return {
        ok: true,
        action: 'rollback',
        project_name: current.project_name,
        from_deployment: id,
        target_deployment: previous.id,
        commit_sha: previous.commit_sha,
        status: 'queued' as const,
      }
    })

    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.httpStatus })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Rollback failed' }, { status: 500 })
  }
}
