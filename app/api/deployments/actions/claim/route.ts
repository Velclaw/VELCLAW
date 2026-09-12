import { NextResponse } from 'next/server'
import { claimNextDeployment } from '@/lib/deploy/store'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN

  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const deployment = await claimNextDeployment()
    return NextResponse.json({ deployment })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to claim deployment' },
      { status: 500 },
    )
  }
}
