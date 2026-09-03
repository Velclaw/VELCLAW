import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session/get-server-session'
import { db } from '@/lib/db/client'
import { tasks } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { getOctokit } from '@/lib/github/client'
import { isVelclawProductUrl, VELCLAW_PRODUCT_DOMAIN, VELCLAW_PRODUCT_URL } from '@/lib/velclaw/product-domain'

function extractVelclawUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const match = value.match(/https:\/\/[^\s\)\]<]+/gi)?.find((url) => isVelclawProductUrl(url))
  return match ?? (isVelclawProductUrl(value.trim()) ? value.trim() : null)
}

async function saveAndReturn(taskId: string, previewUrl: string, extra: Record<string, unknown> = {}) {
  await db.update(tasks).set({ previewUrl }).where(eq(tasks.id, taskId))
  return NextResponse.json({
    success: true,
    data: { hasDeployment: true, previewUrl, ...extra },
  })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { taskId } = await params
    const taskResult = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id), isNull(tasks.deletedAt)))
      .limit(1)
    const task = taskResult[0]
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

    // Only expose first-party Velclaw URLs. Legacy/provider hostnames are deliberately hidden.
    if (isVelclawProductUrl(task.previewUrl)) {
      return saveAndReturn(taskId, task.previewUrl, { cached: true })
    }

    if (!task.branchName || !task.repoUrl) {
      return NextResponse.json({
        success: true,
        data: { hasDeployment: false, message: 'Task does not have branch or repository information' },
      })
    }

    const githubMatch = task.repoUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/)
    if (!githubMatch)
      return NextResponse.json({
        success: true,
        data: { hasDeployment: false, message: 'Invalid GitHub repository URL' },
      })
    const [, owner, repo] = githubMatch
    const octokit = await getOctokit()
    if (!octokit.auth)
      return NextResponse.json({
        success: true,
        data: { hasDeployment: false, message: 'GitHub account not connected' },
      })

    let latestCommitSha: string | null = null
    try {
      const { data: branch } = await octokit.rest.repos.getBranch({ owner, repo, branch: task.branchName })
      latestCommitSha = branch.commit.sha
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return NextResponse.json({ success: true, data: { hasDeployment: false, message: 'Branch not found' } })
      }
      throw error
    }

    // Search completed successful checks for a first-party Velclaw deployment URL.
    if (latestCommitSha) {
      try {
        const { data } = await octokit.rest.checks.listForRef({ owner, repo, ref: latestCommitSha, per_page: 100 })
        for (const check of data.check_runs) {
          if (check.status !== 'completed' || check.conclusion !== 'success') continue
          const previewUrl =
            extractVelclawUrl(check.output?.summary) ??
            extractVelclawUrl(check.output?.text) ??
            extractVelclawUrl(check.details_url)
          if (previewUrl) return saveAndReturn(taskId, previewUrl, { checkId: check.id, createdAt: check.completed_at })
        }
      } catch (error) {
        console.error('Error checking GitHub Checks:', error)
      }
    }

    // Search GitHub Deployments for a successful first-party environment URL.
    try {
      const { data: deployments } = await octokit.rest.repos.listDeployments({
        owner,
        repo,
        ref: task.branchName,
        per_page: 10,
      })
      for (const deployment of deployments) {
        const { data: statuses } = await octokit.rest.repos.listDeploymentStatuses({
          owner,
          repo,
          deployment_id: deployment.id,
          per_page: 10,
        })
        const status = statuses.find((item) => item.state === 'success')
        const previewUrl = extractVelclawUrl(status?.environment_url) ?? extractVelclawUrl(status?.target_url)
        if (previewUrl)
          return saveAndReturn(taskId, previewUrl, { deploymentId: deployment.id, createdAt: deployment.created_at })
      }
    } catch (error) {
      console.error('Error checking GitHub Deployments:', error)
    }

    // Final fallback: commit statuses, again requiring a first-party Velclaw URL.
    if (latestCommitSha) {
      try {
        const { data: statuses } = await octokit.rest.repos.listCommitStatusesForRef({
          owner,
          repo,
          ref: latestCommitSha,
          per_page: 100,
        })
        const status = statuses.find(
          (item) => item.state === 'success' && item.target_url && isVelclawProductUrl(item.target_url),
        )
        if (status?.target_url) return saveAndReturn(taskId, status.target_url, { createdAt: status.created_at })
      } catch (error) {
        console.error('Error checking commit statuses:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        hasDeployment: false,
        canonicalHost: VELCLAW_PRODUCT_DOMAIN,
        canonicalUrl: VELCLAW_PRODUCT_URL,
        message: 'No verified Velclaw deployment URL found',
      },
    })
  } catch (error) {
    console.error('Error in deployment API:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}
