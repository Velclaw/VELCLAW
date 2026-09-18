import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { createHostingDeployment } from '@/lib/hosting'
import { getDeployment, listDeployments } from '@/lib/deploy/store'

const REPO_PATTERN = /^https:\/\/github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}(?:\.git)?$/i
const ENV_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/
const DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+velclaw\.cfd$/i

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { return NextResponse.json({ deployments: await listDeployments(session.user.id) }) }
  catch (error) { console.error('[deployments] list failed', error); return NextResponse.json({ error: 'Deployment store unavailable' }, { status: 503 }) }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const input = await request.json().catch(() => null)
  const repoUrl = typeof input?.repoUrl === 'string' ? input.repoUrl.trim() : ''
  const branch = typeof input?.branch === 'string' && input.branch.trim() ? input.branch.trim() : 'main'
  const projectName = typeof input?.projectName === 'string' && input.projectName.trim() ? input.projectName.trim() : 'velclaw-app'
  const commitSha = typeof input?.commitSha === 'string' ? input.commitSha.trim() : null
  const customDomain = typeof input?.customDomain === 'string' ? input.customDomain.trim().toLowerCase() : null
  const env = input?.env && typeof input.env === 'object' && !Array.isArray(input.env) ? input.env : null

  if (!REPO_PATTERN.test(repoUrl)) return NextResponse.json({ error: 'Only canonical HTTPS GitHub repository URLs are supported' }, { status: 400 })
  if (!/^[A-Za-z0-9._/-]{1,120}$/.test(branch)) return NextResponse.json({ error: 'Invalid branch name' }, { status: 400 })
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/.test(projectName)) return NextResponse.json({ error: 'Invalid project name' }, { status: 400 })
  if (commitSha && !/^[0-9a-f]{40}$/i.test(commitSha)) return NextResponse.json({ error: 'Invalid commit SHA' }, { status: 400 })
  if (customDomain && !DOMAIN_PATTERN.test(customDomain)) return NextResponse.json({ error: 'Only *.velclaw.cfd custom domains are supported' }, { status: 400 })
  if (env) {
    const entries = Object.entries(env)
    if (entries.length > 100 || entries.some(([key, value]) => !ENV_KEY_PATTERN.test(key) || typeof value !== 'string' || value.length > 8192 || /[\r\n]/.test(value))) return NextResponse.json({ error: 'Invalid environment variables' }, { status: 400 })
  }

  try {
    const created = await createHostingDeployment({ userId: session.user.id, projectName, repoUrl, branch, commitSha, env, customDomain })
    if (created.provider === 'self-hosted' && created.externalId) {
      const deployment = await getDeployment(created.externalId, session.user.id)
      if (deployment) return NextResponse.json({ deployment }, { status: 202 })
      throw new Error('Created deployment could not be loaded')
    }

    return NextResponse.json({ deployment: created }, { status: 202 })
  } catch (error) {
    console.error('[deployments] create failed', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Deployment provider unavailable' }, { status: 503 })
  }
}
