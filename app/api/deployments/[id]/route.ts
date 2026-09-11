import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 3 })

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Deployment id is required' }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const action = body?.action || 'rollback'
  if (action !== 'rollback') return NextResponse.json({ error: 'Unsupported deployment action' }, { status: 400 })

  try {
    const result = await sql.begin(async (tx) => {
      const currentRows = await tx`
        SELECT id, user_id, project_name, repo_url, branch, status
        FROM velclaw_deployments
        WHERE id = ${id} AND user_id = ${session.user.id}
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
        SELECT id, commit_sha, env_json, custom_domain
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
      if (previousRows.length === 0) return { error: 'No previous ready deployment is available for rollback', httpStatus: 409 } as const

      const previous = previousRows[0] as { id: string; commit_sha: string; env_json: string | null; custom_domain: string | null }
      await tx`
        UPDATE velclaw_deployments
        SET status = 'queued',
            commit_sha = ${previous.commit_sha},
            env_json = ${previous.env_json},
            custom_domain = ${previous.custom_domain},
            error = NULL,
            url = NULL,
            logs = logs || ${JSON.stringify([`Rollback queued to deployment ${previous.id} at ${previous.commit_sha}`])}::jsonb,
            updated_at = NOW()
        WHERE id = ${id} AND user_id = ${session.user.id}
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
    console.error('[deployments/rollback]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Rollback failed' }, { status: 500 })
  }
}
