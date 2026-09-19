import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'velclaw-control-plane',
      domain: process.env.VELCLAW_PUBLIC_DOMAIN || 'velclaw.com',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'cache-control': 'no-store',
      },
    },
  )
}
