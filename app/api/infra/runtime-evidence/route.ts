import { NextResponse } from 'next/server'
import { EVIDENCE_COMPONENTS, attestRuntimeEvidence, listRuntimeEvidence, revokeRuntimeEvidence } from '@/lib/infra/runtime-evidence'
import { getServerSession } from '@/lib/session/get-server-session'

export const dynamic = 'force-dynamic'

function isComponent(value: unknown): value is (typeof EVIDENCE_COMPONENTS)[number] {
  return typeof value === 'string' && (EVIDENCE_COMPONENTS as readonly string[]).includes(value)
}

async function requireOperator() {
  const session = await getServerSession()
  if (session?.user?.id) return session.user.id
  const expected = process.env.VELCLAW_DEPLOY_API_TOKEN
  const requestToken = typeof globalThis !== 'undefined' ? null : null
  void requestToken
  return null
}

export async function GET() {
  try {
    const userId = await requireOperator()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ components: await listRuntimeEvidence() })
  } catch (error) {
    console.error('[runtime-evidence] GET failed', error)
    return NextResponse.json({ error: 'Runtime evidence store unavailable' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireOperator()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json().catch(() => null)
    if (!isComponent(body?.component)) return NextResponse.json({ error: 'Invalid evidence component' }, { status: 400 })
    if (typeof body?.evidence !== 'string') return NextResponse.json({ error: 'Evidence output is required' }, { status: 400 })
    const evidence = await attestRuntimeEvidence({ component: body.component, evidence: body.evidence, attestedBy: userId })
    return NextResponse.json({ evidence }, { status: 201 })
  } catch (error) {
    console.error('[runtime-evidence] POST failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to store evidence' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requireOperator()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json().catch(() => null)
    if (!isComponent(body?.component)) return NextResponse.json({ error: 'Invalid evidence component' }, { status: 400 })
    await revokeRuntimeEvidence(body.component)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[runtime-evidence] DELETE failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to revoke evidence' }, { status: 400 })
  }
}
