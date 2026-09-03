import { NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL || '', { max: 3 })

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionHeader = request.headers.get('x-velclaw-admin-token')
  if (!process.env.VELCLAW_DEPLOY_API_TOKEN || sessionHeader !== process.env.VELCLAW_DEPLOY_API_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!process.env.POSTGRES_URL) return NextResponse.json({ error: 'POSTGRES_URL is not configured' }, { status: 503 })
  const { id } = await context.params
  const [target] = await sql`SELECT * FROM velclaw_deployments WHERE id = ${id} LIMIT 1`
  if (!target) return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
  if (target.status !== 'ready' || !target.url) return NextResponse.json({ error: 'Only a ready deployment can be rolled back to' }, { status: 409 })

  const [previous] = await sql`
    SELECT * FROM velclaw_deployments
    WHERE project_name = ${target.project_name} AND status = 'ready' AND id <> ${id}
    ORDER BY created_at DESC LIMIT 1
  `
  if (!previous) return NextResponse.json({ error: 'No previous ready deployment exists' }, { status: 409 })

  await sql`
    UPDATE velclaw_deployments
    SET status = 'ready', url = ${previous.url}, error = NULL,
        logs = logs || ${JSON.stringify([`Rollback selected deployment ${previous.id}`])}::jsonb, updated_at = now()
    WHERE id = ${id}
  `
  return NextResponse.json({ ok: true, deploymentId: id, rolledBackTo: previous.id, url: previous.url })
}
