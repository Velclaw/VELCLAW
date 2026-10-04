import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { getEcosystemSummary } from '@/lib/ecosystem/registry'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getEcosystemSummary())
}
