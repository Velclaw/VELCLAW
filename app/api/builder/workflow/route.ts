import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { runBuilderWorkflow, type BuilderWorkspaceFile } from '@/lib/builder/agent'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const input = await request.json().catch(() => null)
  const prompt = typeof input?.prompt === 'string' ? input.prompt.trim() : ''
  const files = Array.isArray(input?.files) ? input.files : []
  const model = typeof input?.model === 'string' ? input.model : undefined
  if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  if (files.length > 150 || !files.every((file: unknown) => file && typeof file === 'object' && typeof (file as { path?: unknown }).path === 'string' && typeof (file as { content?: unknown }).content === 'string')) {
    return NextResponse.json({ error: 'Invalid workspace files' }, { status: 400 })
  }

  try {
    return NextResponse.json(await runBuilderWorkflow({ prompt, model, files: files as BuilderWorkspaceFile[] }))
  } catch (error) {
    console.error('[builder/workflow]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Velclaw autonomous workflow failed' }, { status: 503 })
  }
}
