import { NextResponse } from 'next/server'
import { getEcosystemSummary } from '@/lib/ecosystem/registry'

export const dynamic = 'force-dynamic'

const jsonHeaders = { 'Cache-Control': 'no-store, max-age=0' }

function healthPayload() {
  const checks = {
    runtime: true,
    database: Boolean(process.env.POSTGRES_URL),
    encryption: Boolean(process.env.ENCRYPTION_KEY),
    github: Boolean(process.env.GITHUB_TOKEN),
  }
  const ecosystem = getEcosystemSummary()
  const ready = checks.runtime && checks.database && checks.encryption
  return {
    ok: ready,
    status: ready ? 'healthy' : 'degraded',
    service: 'velclaw',
    version: process.env.VELCLAW_VERSION || '2.0.0',
    commit: process.env.VELCLAW_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || null,
    checks,
    ecosystem: { configured: ecosystem.configured, total: ecosystem.total },
    timestamp: new Date().toISOString(),
  }
}

export async function GET() {
  const payload = healthPayload()
  return NextResponse.json(payload, { status: payload.ok ? 200 : 503, headers: jsonHeaders })
}

export async function HEAD() {
  const payload = healthPayload()
  return new NextResponse(null, { status: payload.ok ? 200 : 503, headers: jsonHeaders })
}
