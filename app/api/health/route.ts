import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const jsonHeaders = {
  'Cache-Control': 'no-store, max-age=0',
}

function healthPayload() {
  return {
    ok: true,
    status: 'healthy',
    service: 'velclaw',
    version: process.env.VELCLAW_VERSION || '2.0.0',
    commit: process.env.VELCLAW_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || null,
    timestamp: new Date().toISOString(),
  }
}

export async function GET() {
  return NextResponse.json(healthPayload(), { headers: jsonHeaders })
}

export async function HEAD() {
  return new NextResponse(null, { status: 200, headers: jsonHeaders })
}
