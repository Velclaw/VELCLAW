import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { getOctokit } from '@/lib/github/client'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
function parseRepository(value: string) {
  const m = value.trim().match(/^(?:https:\/\/github\.com\/)?([^/]+)\/([^/]+?)(?:\.git)?$/i)
  return m ? { owner: m[1], repo: m[2] } : null
}
export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = parseRepository(new URL(request.url).searchParams.get('repo') || 'Velclaw/VELCLAW')
  if (!parsed) return NextResponse.json({ error: 'Invalid GitHub repository' }, { status: 400 })
  try {
    const octokit = await getOctokit()
    if (!octokit.auth) return NextResponse.json({ error: 'GitHub authentication required' }, { status: 401 })
    const [repo, pulls, workflows] = await Promise.all([
      octokit.rest.repos.get(parsed),
      octokit.rest.pulls.list({ ...parsed, state: 'open', per_page: 10, sort: 'updated', direction: 'desc' }),
      octokit.rest.actions.listWorkflowRunsForRepo({ ...parsed, per_page: 10 }),
    ])
    return NextResponse.json({
      repository: {
        fullName: repo.data.full_name,
        private: repo.data.private,
        defaultBranch: repo.data.default_branch,
        htmlUrl: repo.data.html_url,
      },
      pullRequests: pulls.data.map((pr) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        draft: pr.draft,
        url: pr.html_url,
        updatedAt: pr.updated_at,
      })),
      workflowRuns: workflows.data.workflow_runs.map((run) => ({
        id: run.id,
        name: run.name,
        status: run.status,
        conclusion: run.conclusion,
        url: run.html_url,
        updatedAt: run.updated_at,
      })),
    })
  } catch (error) {
    console.error('GitHub overview failed', error)
    return NextResponse.json({ error: 'GitHub integration unavailable' }, { status: 502 })
  }
}
