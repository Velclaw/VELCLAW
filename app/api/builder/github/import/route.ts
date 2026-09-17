import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { importGitHubWorkspace } from '@/lib/builder/github'

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const input = await request.json().catch(() => null)
  const repoUrl = typeof input?.repoUrl === 'string' ? input.repoUrl.trim() : ''
  const branch = typeof input?.branch === 'string' && input.branch.trim() ? input.branch.trim() : 'main'
  if (!/^https:\/\/github\.com\/[^/]+\/[^/]+(?:\.git)?$/i.test(repoUrl)) return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 })

  try {
    return NextResponse.json(await importGitHubWorkspace(repoUrl, branch))
  } catch (error) {
    console.error('[builder/github/import]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'GitHub import failed' }, { status: 400 })
  }
}
