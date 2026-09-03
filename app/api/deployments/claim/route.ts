import { NextResponse } from 'next/server'
import { claimNextDeployment } from '@/lib/deploy/store'

function authorized(request: Request) {
  const configured = process.env.VELCLAW_DEPLOY_API_TOKEN
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return Boolean(configured && provided && provided === configured)
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const deployment = await claimNextDeployment()
    return NextResponse.json({ deployment: deployment || null })
  } catch (error) {
    console.error('[deployments/claim]', error)
    return NextResponse.json({ error: 'Deployment store unavailable' }, { status: 503 })
  }
}
