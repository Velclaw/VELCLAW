export type ReviewFinding = {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  message: string
  file?: string
  line?: number
}

export type ReviewGate = {
  passed: boolean
  blockingFindings: ReviewFinding[]
}

/**
 * Applies a deterministic merge gate to reviewer findings.
 * Provider-specific review adapters should normalize their output into ReviewFinding.
 */
export function evaluateReviewGate(findings: ReviewFinding[]): ReviewGate {
  const blockingFindings = findings.filter((finding) => finding.severity === 'critical' || finding.severity === 'high')

  return {
    passed: blockingFindings.length === 0,
    blockingFindings,
  }
}
