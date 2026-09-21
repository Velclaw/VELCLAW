import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { getUserApiKey } from '@/lib/api-keys/user-keys'

export const dynamic = 'force-dynamic'

async function authorized() {
  const session = await getServerSession()
  if (!session?.user?.id) return null
  const apiKey = await getUserApiKey('openai')
  return apiKey ? { apiKey } : null
}

async function openaiRequest(apiKey: string, url: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'agents=v1',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })
}

type Params = { params: Promise<{ sessionId: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await authorized()
  if (!auth) return NextResponse.json({ error: 'Unauthorized or OpenAI API key unavailable' }, { status: 401 })

  const { sessionId } = await params
  if (!sessionId) return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })

  try {
    const response = await openaiRequest(auth.apiKey, `https://api.openai.com/v1/agents/sessions/${encodeURIComponent(sessionId)}`)
    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Session retrieval failed' }, { status: 503 })
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await authorized()
  if (!auth) return NextResponse.json({ error: 'Unauthorized or OpenAI API key unavailable' }, { status: 401 })

  const { sessionId } = await params
  if (!sessionId) return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const text = typeof body?.message === 'string' ? body.message.trim().slice(0, 12000) : ''
  if (!text) return NextResponse.json({ error: 'message is required' }, { status: 400 })

  try {
    const response = await openaiRequest(
      auth.apiKey,
      `https://api.openai.com/v1/agents/sessions/${encodeURIComponent(sessionId)}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [
            {
              type: 'agent.session.input.message',
              input: [
                {
                  role: 'user',
                  content: [{ type: 'input_text', text }],
                },
              ],
            },
          ],
        }),
      },
    )
    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Session event failed' }, { status: 503 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await authorized()
  if (!auth) return NextResponse.json({ error: 'Unauthorized or OpenAI API key unavailable' }, { status: 401 })

  const { sessionId } = await params
  if (!sessionId) return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })

  try {
    const response = await openaiRequest(
      auth.apiKey,
      `https://api.openai.com/v1/agents/sessions/${encodeURIComponent(sessionId)}`,
      { method: 'DELETE' },
    )
    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Session deletion failed' }, { status: 503 })
  }
}
