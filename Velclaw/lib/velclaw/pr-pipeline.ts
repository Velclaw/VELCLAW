import { evaluateReviewGate, type ReviewFinding } from './review'

export type PullRequestPlan = {
  branch: string
  title: string
  body: string
  allowed: boolean
  blockingFindings: ReviewFinding[]
}

export function planPullRequest(input: {
  branch: string
  title: string
  body?: string
  findings: ReviewFinding[]
}): PullRequestPlan {
  if (!/^[A-Za-z0-9][A-Za-z0-9._/-]{0,100}$/.test(input.branch)) {
    throw new Error('Invalid branch name')
  }

  const gate = evaluateReviewGate(input.findings)

  return {
    branch: input.branch,
    title: input.title.trim() || 'Velclaw changes',
    body: input.body?.trim() || 'Created by Velclaw after agent execution and review.',
    allowed: gate.passed,
    blockingFindings: gate.blockingFindings,
  }
}
