import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import { getServerSession } from '@/lib/session/get-server-session'
import { getUserGitHubToken } from '@/lib/github/user-token'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const headers = { 'Cache-Control': 'private, no-store, max-age=0' }
const validName = /^[A-Za-z0-9_.-]{1,100}$/

export async function GET(request: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
  }

  const token = await getUserGitHubToken(request)
  if (!token) {
    return NextResponse.json(
      { error: 'GitHub account is not connected', code: 'GITHUB_NOT_CONNECTED' },
      { status: 409, headers },
    )
  }

  const owner = request.nextUrl.searchParams.get('owner')?.trim() ?? ''
  const repo = request.nextUrl.searchParams.get('repo')?.trim() ?? ''
  if (!validName.test(owner) || !validName.test(repo)) {
    return NextResponse.json(
      { error: 'Valid owner and repo query parameters are required' },
      { status: 400, headers },
    )
  }

  const observedAt = new Date().toISOString()
  const octokit = new Octokit({ auth: token })

  try {
    const { data: repository } = await octokit.rest.repos.get({ owner, repo })
    const [workflowResult, deploymentResult] = await Promise.allSettled([
      octokit.rest.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        branch: repository.default_branch,
        per_page: 1,
      }),
      octokit.rest.repos.listDeployments({ owner, repo, per_page: 5 }),
    ])

    const latestRun = workflowResult.status === 'fulfilled'
      ? workflowResult.value.data.workflow_runs[0] ?? null
      : null
    const deployments = deploymentResult.status === 'fulfilled'
      ? deploymentResult.value.data
      : []

    const deploymentStatuses = await Promise.all(
      deployments.map(async (deployment) => {
        try {
          const { data: statuses } = await octokit.rest.repos.listDeploymentStatuses({
            owner,
            repo,
            deployment_id: deployment.id,
            per_page: 1,
          })
          const latest = statuses[0]
          return {
            id: deployment.id,
            environment: deployment.environment,
            ref: deployment.ref,
            sha: deployment.sha,
            created_at: deployment.created_at,
            updated_at: latest?.updated_at ?? deployment.created_at,
            state: latest?.state ?? 'pending',
            environment_url: latest?.environment_url ?? null,
            source: 'github:deployment-status',
            observed_at: observedAt,
          }
        } catch {
          return {
            id: deployment.id,
            environment: deployment.environment,
            ref: deployment.ref,
            sha: deployment.sha,
            created_at: deployment.created_at,
            updated_at: deployment.created_at,
            state: 'unknown',
            environment_url: null,
            source: 'github:deployment-status',
            observed_at: observedAt,
          }
        }
      }),
    )

    return NextResponse.json(
      {
        repository: repository.full_name,
        default_branch: repository.default_branch,
        source: 'GitHub REST API',
        observed_at: observedAt,
        last_checked_at: observedAt,
        ci: {
          state: workflowResult.status === 'rejected' ? 'unavailable' : latestRun?.conclusion ?? latestRun?.status ?? 'no-runs',
          status: workflowResult.status === 'rejected' ? 'unavailable' : latestRun?.status ?? 'no-runs',
          conclusion: latestRun?.conclusion ?? null,
          head_sha: latestRun?.head_sha ?? null,
          url: latestRun?.html_url ?? null,
          updated_at: latestRun?.updated_at ?? null,
          source: 'github:actions',
          observed_at: observedAt,
        },
        deployments: {
          state: deploymentResult.status === 'rejected' ? 'unavailable' : 'available',
          items: deploymentStatuses,
          source: 'github:deployments',
          observed_at: observedAt,
        },
      },
      { headers },
    )
  } catch (error) {
    const status = typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : 0
    return NextResponse.json(
      {
        error: 'Unable to read CI/deployment status from GitHub',
        code: status === 403 ? 'GITHUB_ACCESS_DENIED_OR_RATE_LIMITED' : 'GITHUB_STATUS_LOOKUP_FAILED',
        source: 'GitHub REST API',
        observed_at: observedAt,
        last_checked_at: observedAt,
      },
      { status: status === 404 ? 404 : 502, headers },
    )
  }
}
