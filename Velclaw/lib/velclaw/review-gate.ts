import type { ReviewFinding } from './review'
import { evaluateReviewGate } from './review'

export type PullRequestGateInput = {
  findings: ReviewFinding[]
  checksPassing: boolean
}

export type PullRequestGateResult = {
  allowed: boolean
  reason: string
}

/**
 * Single deterministic policy for deciding whether Velclaw may advance a PR
 * toward merge. Provider integrations only supply normalized findings.
 */
export function evaluatePullRequestGate(input: PullRequestGateInput): PullRequestGateResult {
  if (!input.checksPassing) {
    return { allowed: false, reason: 'Required checks are not passing' }
  }

  const review = evaluateReviewGate(input.findings)
  if (!review.passed) {
    return {
      allowed: false,
      reason: `${review.blockingFindings.length} blocking review finding(s)`,
    }
  }

  return { allowed: true, reason: 'Required checks and AI review gate passed' }
}
