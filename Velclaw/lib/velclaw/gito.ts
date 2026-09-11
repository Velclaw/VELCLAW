import { runCommandInSandbox, type CommandResult } from '@/lib/sandbox/commands'
import type { ReviewFinding } from './review'

export type GitoReviewOptions = { model?: string }

export type GitoReviewResult = {
  success: boolean
  findings: ReviewFinding[]
  report?: string
  error?: string
}

function parseFindings(report: string): ReviewFinding[] {
  const findings: ReviewFinding[] = []
  for (const line of report.split('\n')) {
    const match = line.match(/\b(CRITICAL|HIGH|MEDIUM|LOW|INFO)\b[:\-]?\s*(.+)/i)
    if (!match) continue
    const severity = match[1].toLowerCase() as ReviewFinding['severity']
    const message = match[2].trim()
    if (message) findings.push({ severity, message })
  }
  return findings
}

/** Runs Gito inside the sandbox; credentials must be provisioned in its environment. */
export async function runGitoReview(
  sandbox: Parameters<typeof runCommandInSandbox>[0],
  options: GitoReviewOptions = {},
): Promise<GitoReviewResult> {
  const args = ['review']
  if (options.model?.trim()) args.push('--model', options.model.trim())
  const result: CommandResult = await runCommandInSandbox(sandbox, 'gito', args)
  const report = [result.output, result.error].filter(Boolean).join('\n').trim()
  return {
    success: result.success,
    findings: parseFindings(report),
    report,
    ...(result.success ? {} : { error: report || 'Gito review failed' }),
  }
}
