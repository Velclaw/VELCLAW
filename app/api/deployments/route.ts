import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { createHostingDeployment } from '@/lib/hosting'
import { listDeployments } from '@/lib/deploy/store'

const REPO_PATTERN = /^https:\/\/(?:github\.com)\/[^/]+\/[^/]+(?:\.git)?$/i

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    return NextResponse.json({ deployments: await listDeployments(session.user.id) })
  } catch (error) {
    console.error('[deployments] list failed', error)
    return NextResponse.json({ error: 'Deployment store unavailable' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const input = await request.json().catch(() => null)
  const repoUrl = typeof input?.repoUrl === 'string' ? input.repoUrl.trim() : ''
  const branch = typeof input?.branch === 'string' && input.branch.trim() ? input.branch.trim() : 'main'
  const projectName =
    typeof input?.projectName === 'string' && input.projectName.trim() ? input.projectName.trim() : 'velclaw-app'
  const commitSha = typeof input?.commitSha === 'string' ? input.commitSha.trim() : null

  if (!REPO_PATTERN.test(repoUrl)) {
    return NextResponse.json({ error: 'Only HTTPS GitHub repository URLs are supported' }, { status: 400 })
  }
  if (!/^[A-Za-z0-9._/-]{1,120}$/.test(branch)) {
    return NextResponse.json({ error: 'Invalid branch name' }, { status: 400 })
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/.test(projectName)) {
    return NextResponse.json({ error: 'Invalid project name' }, { status: 400 })
  }

  try {
    const deployment = await createHostingDeployment({
      userId: session.user.id,
      projectName,
      repoUrl,
      branch,
      commitSha,
    })
    return NextResponse.json({ deployment }, { status: 202 })
  } catch (error) {
    console.error('[deployments] create failed', error)
    const message = error instanceof Error ? error.message : 'Deployment provider unavailable'
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
