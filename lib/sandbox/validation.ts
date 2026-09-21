import { Sandbox } from '@vercel/sandbox'
import { runInProject } from './commands'
import { TaskLogger } from '@/lib/utils/task-logger'
import { detectPackageManager } from './package-manager'

export interface ValidationResult {
  success: boolean
  checks: Array<{
    name: string
    status: 'passed' | 'failed' | 'skipped'
    output?: string
    error?: string
  }>
  failureSummary?: string
}

function commandForScript(packageManager: 'pnpm' | 'yarn' | 'npm', script: string): [string, string[]] {
  if (packageManager === 'npm') return ['npm', ['run', script]]
  return [packageManager, [script]]
}

function compactOutput(value?: string, limit = 4000) {
  if (!value) return ''
  const normalized = value.trim()
  return normalized.length > limit ? `${normalized.slice(-limit)}\n...[truncated]` : normalized
}

/**
 * Run deterministic repository checks after an agent has edited the workspace.
 * Missing optional scripts are skipped; a script that exists and fails is a
 * hard validation failure and must be repaired before the task can complete.
 */
export async function validateSandboxProject(sandbox: Sandbox, logger: TaskLogger): Promise<ValidationResult> {
  const checks: ValidationResult['checks'] = []
  const packageJson = await runInProject(sandbox, 'cat', ['package.json'])

  if (!packageJson.success || !packageJson.output) {
    checks.push({
      name: 'project manifest',
      status: 'skipped',
      output: 'No package.json found; Node project checks skipped.',
    })
    return { success: true, checks }
  }

  let scripts: Record<string, string> = {}
  try {
    const parsed = JSON.parse(packageJson.output)
    scripts = parsed?.scripts && typeof parsed.scripts === 'object' ? parsed.scripts : {}
  } catch {
    checks.push({ name: 'project manifest', status: 'failed', error: 'package.json could not be parsed as JSON.' })
    return { success: false, checks, failureSummary: 'package.json could not be parsed as JSON.' }
  }

  const packageManager = await detectPackageManager(sandbox, logger)
  const requestedChecks = ['type-check', 'lint', 'test', 'build']

  for (const script of requestedChecks) {
    if (!scripts[script]) {
      checks.push({ name: script, status: 'skipped', output: `No ${script} script is defined.` })
      continue
    }

    const [command, args] = commandForScript(packageManager, script)
    await logger.info(`Validation: running ${command} ${args.join(' ')}`)
    const result = await runInProject(sandbox, command, args)
    const output = compactOutput(result.output)
    const error = compactOutput(result.error)

    if (result.success) {
      checks.push({ name: script, status: 'passed', output })
      await logger.success(`Validation passed: ${script}`)
    } else {
      checks.push({ name: script, status: 'failed', output, error })
      await logger.error(`Validation failed: ${script}`)
    }
  }

  const failures = checks.filter((check) => check.status === 'failed')
  if (failures.length === 0) {
    await logger.success('Deterministic validation passed')
    return { success: true, checks }
  }

  const failureSummary = failures
    .map((failure) => {
      const details = [failure.error, failure.output].filter(Boolean).join('\n')
      return `## ${failure.name}\n${details || 'Command failed without output.'}`
    })
    .join('\n\n')

  return { success: false, checks, failureSummary }
}
