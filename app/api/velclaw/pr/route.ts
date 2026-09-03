import { NextResponse } from 'next/server'
import { createPullRequest } from '@/lib/github/client'
import { planPullRequest } from '@/lib/velclaw/pr-pipeline'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const repoUrl = typeof body.repoUrl === 'string' ? body.repoUrl.trim() : ''
    const baseBranch = typeof body.baseBranch === 'string' && body.baseBranch.trim() ? body.baseBranch.trim() : 'main'

    if (!repoUrl) {
      return NextResponse.json({ ok: false, error: 'repoUrl is required' }, { status: 400 })
    }

    const plan = planPullRequest({
      branch: body.branch,
      title: body.title,
      body: body.body,
      findings: body.findings ?? [],
    })

    if (!plan.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Review gate blocked pull request creation',
          blockingFindings: plan.blockingFindings,
        },
        { status: 422 },
      )
    }

    const result = await createPullRequest({
      repoUrl,
      branchName: plan.branch,
      title: plan.title,
      body: plan.body,
      baseBranch,
    })

    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error ?? 'Failed to create pull request' }, { status: 502 })
    }

    return NextResponse.json({
      ok: true,
      pr: {
        number: result.prNumber,
        url: result.prUrl,
        branch: plan.branch,
        baseBranch,
      },
    })
  } catch (error) {
    console.error('Velclaw PR creation failed:', error)
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
}
