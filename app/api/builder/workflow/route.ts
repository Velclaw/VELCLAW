import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { runBuilderAgent, type BuilderWorkspaceFile } from '@/lib/builder/agent'

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
    let workspace = files as BuilderWorkspaceFile[]
    const steps: Array<{ role: string; output: string }> = []

    const coder = await runBuilderAgent({ role: 'coder', prompt: `Implement this request completely: ${prompt}`, files: workspace, model })
    steps.push({ role: 'coder', output: coder.output })
    if (coder.changes.length) {
      const map = new Map(workspace.map((file) => [file.path, file.content]))
      for (const change of coder.changes) map.set(change.path, change.content)
      workspace = Array.from(map, ([path, content]) => ({ path, content }))
    }

    const tester = await runBuilderAgent({ role: 'tester', prompt: `Verify the implementation for this request: ${prompt}. Produce exact browser-terminal commands for install, type-check, test and build. Do not claim execution.`, files: workspace, model })
    steps.push({ role: 'tester', output: tester.output })

    const reviewer = await runBuilderAgent({ role: 'reviewer', prompt: `Review the implementation for this request: ${prompt}. Focus on correctness, security, accessibility, runtime failures and deployment readiness.`, files: workspace, model })
    steps.push({ role: 'reviewer', output: reviewer.output })

    return NextResponse.json({ output: steps.map((step) => `[${step.role}]\n${step.output}`).join('\n\n'), changes: workspace.filter((file) => !files.some((original: BuilderWorkspaceFile) => original.path === file.path && original.content === file.content)), steps })
  } catch (error) {
    console.error('[builder/workflow]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Velclaw autonomous workflow failed' }, { status: 503 })
  }
}
