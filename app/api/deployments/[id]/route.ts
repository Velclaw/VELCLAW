import { NextResponse } from 'next/server'
import { getDeployment } from '@/lib/deploy/store'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const sessionHeader = request.headers.get('x-velclaw-admin-token')
  const sessionCookie = request.headers.get('cookie')
  const configured = process.env.VELCLAW_DEPLOY_API_TOKEN
  if (!configured || (sessionHeader !== configured && !sessionCookie?.includes('velclaw_session'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await context.params
  try {
    const deployment = await getDeployment(id)
    if (!deployment) return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
    return NextResponse.json({ deployment })
  } catch (error) {
    console.error('[deployments/id]', error)
    return NextResponse.json({ error: 'Deployment store unavailable' }, { status: 503 })
  }
}
