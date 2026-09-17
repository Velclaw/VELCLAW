import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { getHostingProvider } from '@/lib/hosting/providers'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({
    provider: getHostingProvider(),
    mode: getHostingProvider() === 'render' ? 'free-provider' : 'self-hosted',
  })
}
