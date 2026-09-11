import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { publishGitHubWorkspace } from '@/lib/builder/github'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const input = await request.json().catch(() => null)
  const repoUrl = typeof input?.repoUrl === 'string' ? input.repoUrl.trim() : ''
  const baseBranch = typeof input?.baseBranch === 'string' ? input.baseBranch.trim() : 'main'
  const branchName = typeof input?.branchName === 'string' ? input.branchName.trim() : ''
  const title = typeof input?.title === 'string' ? input.title.trim().slice(0, 160) : ''
  const body = typeof input?.body === 'string' ? input.body.slice(0, 4000) : undefined
  const files = Array.isArray(input?.files) ? input.files : []

  if (!/^https:\/\/github\.com\/[^/]+\/[^/]+(?:\.git)?$/i.test(repoUrl) || !title || !branchName) {
    return NextResponse.json({ error: 'Repository, branch and title are required' }, { status: 400 })
  }
  if (!files.every((file: unknown) => file && typeof file === 'object' && typeof (file as { path?: unknown }).path === 'string' && typeof (file as { content?: unknown }).content === 'string')) {
    return NextResponse.json({ error: 'Invalid workspace files' }, { status: 400 })
  }

  try {
    const result = await publishGitHubWorkspace({ repoUrl, baseBranch, branchName, title, body, files })
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('[builder/github/publish]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'GitHub publish failed' }, { status: 400 })
  }
}
