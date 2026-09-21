import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { getReleaseProvider } from '@/lib/release'

const REPO_PATTERN = /^https:\/\/github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}(?:\.git)?$/i

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const input = await request.json().catch(() => null)
  const projectName = typeof input?.projectName === 'string' ? input.projectName.trim() : ''
  const repoUrl = typeof input?.repoUrl === 'string' ? input.repoUrl.trim() : ''
  const branch = typeof input?.branch === 'string' && input.branch.trim() ? input.branch.trim() : 'main'
  const commitSha = typeof input?.commitSha === 'string' ? input.commitSha.trim() : ''

  if (!projectName || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/.test(projectName)) {
    return NextResponse.json({ error: 'Invalid project name' }, { status: 400 })
  }
  if (!REPO_PATTERN.test(repoUrl)) return NextResponse.json({ error: 'Only canonical HTTPS GitHub repository URLs are supported' }, { status: 400 })
  if (!/^[A-Za-z0-9._/-]{1,120}$/.test(branch)) return NextResponse.json({ error: 'Invalid branch name' }, { status: 400 })
  if (!/^[0-9a-f]{40}$/i.test(commitSha)) return NextResponse.json({ error: 'A 40-character commit SHA is required' }, { status: 400 })

  try {
    const release = await getReleaseProvider().trigger({ projectName, repoUrl, branch, commitSha })
    return NextResponse.json({ release }, { status: 202 })
  } catch (error) {
    console.error('[releases] trigger failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Release provider unavailable' }, { status: 503 })
  }
}
