import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { runBuilderAgent, runBuilderWorkflow, type BuilderWorkspaceFile } from '@/lib/builder/agent'

const roles = new Set(['coder', 'reviewer', 'tester', 'deployer'])

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const input = await request.json().catch(() => null)
  const role = typeof input?.role === 'string' ? input.role : 'coder'
  const prompt = typeof input?.prompt === 'string' ? input.prompt : ''
  const model = typeof input?.model === 'string' ? input.model : undefined
  const auto = input?.auto !== false
  const files = Array.isArray(input?.files) ? input.files : []

  if (!roles.has(role)) return NextResponse.json({ error: 'Invalid agent role' }, { status: 400 })
  if (!prompt.trim()) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  if (files.length > 150 || !files.every((file: unknown) => file && typeof file === 'object' && typeof (file as { path?: unknown }).path === 'string' && typeof (file as { content?: unknown }).content === 'string')) {
    return NextResponse.json({ error: 'Invalid workspace files' }, { status: 400 })
  }

  try {
    if (role === 'coder' && auto) {
      return NextResponse.json(await runBuilderWorkflow({ prompt, model, files: files as BuilderWorkspaceFile[] }))
    }

    const result = await runBuilderAgent({ role: role as 'coder' | 'reviewer' | 'tester' | 'deployer', prompt, model, files: files as BuilderWorkspaceFile[] })
    return NextResponse.json(result)
  } catch (error) {
    console.error('[builder/agent]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Velclaw Agent failed' }, { status: 503 })
  }
}
