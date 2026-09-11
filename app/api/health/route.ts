import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'velclaw',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  })
}
