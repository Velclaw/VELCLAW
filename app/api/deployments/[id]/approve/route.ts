import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { approveDeployment } from '@/lib/deploy/store'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Params) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Deployment id is required' }, { status: 400 })

  try {
    const deployment = await approveDeployment(id, session.user.id)
    if (!deployment) return NextResponse.json({ error: 'Deployment is not awaiting approval or was not found' }, { status: 409 })
    return NextResponse.json({ deployment })
  } catch (error) {
    console.error('[deployments/approve]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Approval failed' }, { status: 500 })
  }
}
