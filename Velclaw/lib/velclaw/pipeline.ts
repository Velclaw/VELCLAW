import { evaluateReviewGate, type ReviewFinding } from './review'

export type VelclawPipelineResult = {
  reviewPassed: boolean
  blockingFindings: ReviewFinding[]
}

/** Combines normalized reviewer findings into the merge decision used by Velclaw. */
export function evaluatePostAgentReview(findings: ReviewFinding[]): VelclawPipelineResult {
  const gate = evaluateReviewGate(findings)
  return {
    reviewPassed: gate.passed,
    blockingFindings: gate.blockingFindings,
  }
}
