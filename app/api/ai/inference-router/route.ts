import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import {
  createDigitalOceanInferenceRouterConfigFromEnv,
  runDigitalOceanInference,
  type DigitalOceanInferenceMessage,
} from '@/lib/velclaw/integrations/digitalocean-inference-router'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const input = await request.json().catch(() => null)
  const messages = Array.isArray(input?.messages) ? input.messages : []
  if (!messages.length || messages.some((message: unknown) => {
    if (!message || typeof message !== 'object') return true
    const value = message as Record<string, unknown>
    return !['system', 'user', 'assistant'].includes(String(value.role)) || typeof value.content !== 'string'
  })) {
    return NextResponse.json({ error: 'messages must contain valid role/content entries' }, { status: 400 })
  }

  const affinity = typeof input?.affinity === 'string' ? input.affinity.trim() : undefined
  const maxTokens = typeof input?.maxTokens === 'number' && input.maxTokens > 0 ? Math.floor(input.maxTokens) : undefined

  try {
    const config = createDigitalOceanInferenceRouterConfigFromEnv()
    const response = await runDigitalOceanInference(
      config,
      messages as DigitalOceanInferenceMessage[],
      { affinity, maxTokens },
    )
    return NextResponse.json(response)
  } catch (error) {
    console.error('[inference-router] request failed', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Inference router request failed' },
      { status: 502 },
    )
  }
}
