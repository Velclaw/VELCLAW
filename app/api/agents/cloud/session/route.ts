import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { createOpenAIAgentsSession } from '@/lib/agents/openai'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const message = typeof body?.message === 'string' ? body.message : ''

  if (!message.trim()) return NextResponse.json({ error: 'message is required' }, { status: 400 })

  const environment = body?.environment === 'none' ? 'none' : 'openai_hosted'
  const multiAgent = Boolean(body?.multiAgent)

  try {
    const result = await createOpenAIAgentsSession({
      message,
      model: typeof body?.model === 'string' ? body.model : undefined,
      instructions: typeof body?.instructions === 'string' ? body.instructions : undefined,
      multiAgent,
      maxConcurrentSubagents: typeof body?.maxConcurrentSubagents === 'number' ? body.maxConcurrentSubagents : undefined,
      environment,
    })

    return NextResponse.json({ ok: true, provider: 'openai-agents-api', session: result }, { status: 201 })
  } catch (error) {
    console.error('[agents/cloud/session]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Agents API session creation failed' },
      { status: 503 },
    )
  }
}
