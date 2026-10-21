import { NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { getServerSession } from '@/lib/session/get-server-session'
import { getUserGitHubToken } from '@/lib/github/user-token'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const headers = { 'Cache-Control': 'private, no-store, max-age=0' }

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
  }

  const token = await getUserGitHubToken()
  if (!token) {
    return NextResponse.json(
      { error: 'GitHub account is not connected', code: 'GITHUB_NOT_CONNECTED' },
      { status: 409, headers },
    )
  }

  const observedAt = new Date().toISOString()
  try {
    const octokit = new Octokit({ auth: token })
    const repositories = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
      per_page: 100,
      sort: 'updated',
      direction: 'desc',
      affiliation: 'owner,collaborator,organization_member',
    })

    const items = repositories.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: repo.owner.login,
      owner_type: repo.owner.type,
      url: repo.html_url,
      visibility: repo.visibility ?? (repo.private ? 'private' : 'public'),
      private: repo.private,
      archived: repo.archived,
      default_branch: repo.default_branch,
      language: repo.language,
      pushed_at: repo.pushed_at,
      updated_at: repo.updated_at,
      source: 'github:user-repositories',
      observed_at: observedAt,
    }))

    return NextResponse.json(
      {
        source: 'GitHub REST API',
        observed_at: observedAt,
        last_checked_at: observedAt,
        complete: true,
        count: items.length,
        repositories: items,
      },
      { headers },
    )
  } catch (error) {
    const status = typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : 0
    const responseStatus = status === 401 || status === 403 ? 502 : 502
    return NextResponse.json(
      {
        error: 'Unable to synchronize repositories from GitHub',
        code: status === 403 ? 'GITHUB_ACCESS_DENIED_OR_RATE_LIMITED' : 'GITHUB_SYNC_FAILED',
        source: 'GitHub REST API',
        observed_at: observedAt,
        last_checked_at: observedAt,
      },
      { status: responseStatus, headers },
    )
  }
}
