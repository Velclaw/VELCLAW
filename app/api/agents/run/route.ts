import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { runOpenAIAgent } from '@/lib/agents/openai'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const message = typeof body?.message === 'string' ? body.message : ''
  const mode = body?.mode === 'multi' ? 'multi' : 'single'

  if (!message.trim()) return NextResponse.json({ error: 'message is required' }, { status: 400 })

  try {
    const result = await runOpenAIAgent({
      message,
      model: typeof body?.model === 'string' ? body.model : undefined,
      instructions: typeof body?.instructions === 'string' ? body.instructions : undefined,
      mode,
      maxConcurrentSubagents: typeof body?.maxConcurrentSubagents === 'number' ? body.maxConcurrentSubagents : undefined,
    })

    return NextResponse.json({ ok: true, provider: 'openai-agents-sdk', ...result })
  } catch (error) {
    console.error('[agents/run]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Agents SDK execution failed' },
      { status: 503 },
    )
  }
}
