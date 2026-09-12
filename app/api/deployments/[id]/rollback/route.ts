import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { queueRollback } from '@/lib/deploy/store'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const adminToken = process.env.VELCLAW_DEPLOY_API_TOKEN
  const provided = request.headers.get('x-velclaw-admin-token') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (adminToken && provided === adminToken) {
    const { id } = await context.params
    const result = await queueRollback(id)
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.error === 'Deployment not found' ? 404 : 409 })
    return NextResponse.json({ ok: true, deploymentId: result.deployment.id, rolledBackTo: result.previousId, status: result.deployment.status })
  }

  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  try {
    const result = await queueRollback(id, session.user.id)
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.error === 'Deployment not found' ? 404 : 409 })
    return NextResponse.json({ ok: true, deploymentId: result.deployment.id, rolledBackTo: result.previousId, status: result.deployment.status })
  } catch (error) {
    console.error('[deployments/rollback]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Rollback failed' }, { status: 500 })
  }
}
