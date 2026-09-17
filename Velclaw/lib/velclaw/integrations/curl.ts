import type { Sandbox } from '@vercel/sandbox'

export type CurlRequest = {
  method?: string
  url: string
  headers?: Record<string, string>
  body?: string
  timeoutSeconds?: number
  followRedirects?: boolean
  maxResponseBytes?: number
}

export type CurlCommandPlan = {
  command: 'curl'
  args: string[]
}

export type CurlExecutionResult = {
  success: boolean
  exitCode?: number
  output?: string
  error?: string
  command: string
}

/**
 * Builds a deterministic curl command for execution inside the configured sandbox.
 * This module never spawns a host process.
 */
export function createCurlPlan(request: CurlRequest): CurlCommandPlan {
  const url = new URL(request.url)

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('curl integration only supports HTTP(S) URLs')
  }

  const args = ['--fail-with-body', '--silent', '--show-error']
  const method = request.method?.toUpperCase() ?? 'GET'

  if (!/^[A-Z]+$/.test(method)) {
    throw new Error('Invalid HTTP method')
  }

  // curl switches to POST when --data-raw is present unless the method is explicit.
  if (method !== 'GET' || request.body !== undefined) args.push('--request', method)
  if (request.followRedirects) args.push('--location')

  if (request.timeoutSeconds !== undefined) {
    if (!Number.isInteger(request.timeoutSeconds) || request.timeoutSeconds < 1 || request.timeoutSeconds > 300) {
      throw new Error('timeoutSeconds must be an integer between 1 and 300')
    }
    args.push('--max-time', String(request.timeoutSeconds))
  }

  if (request.maxResponseBytes !== undefined) {
    if (!Number.isInteger(request.maxResponseBytes) || request.maxResponseBytes < 1) {
      throw new Error('maxResponseBytes must be a positive integer')
    }
    // Early rejection optimization only. executeCurlPlanInSandbox enforces the cap
    // while consuming streamed output as well.
    args.push('--max-filesize', String(request.maxResponseBytes))
  }

  for (const [name, value] of Object.entries(request.headers ?? {})) {
    if (!name || /[\r\n]/.test(name) || /[\r\n]/.test(value)) {
      throw new Error('Invalid HTTP header')
    }
    args.push('--header', `${name}: ${value}`)
  }

  if (request.body !== undefined) args.push('--data-raw', request.body)
  args.push(url.toString())

  return { command: 'curl', args }
}

function shellEscape(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`
}

/**
 * Executes a curl plan inside the Vercel Sandbox.
 *
 * When maxResponseBytes is configured, stdout is piped through head so the
 * sandbox never has to consume an unbounded streamed response. The command
 * returns exit code 100 with a deterministic error when the cap is exceeded.
 */
export async function executeCurlPlanInSandbox(
  sandbox: Sandbox,
  plan: CurlCommandPlan,
  maxResponseBytes?: number,
): Promise<CurlExecutionResult> {
  const args = plan.args.map(shellEscape).join(' ')
  const command = `curl ${args}`

  if (maxResponseBytes === undefined) {
    const result = await sandbox.runCommand(plan.command, plan.args)
    const output = await result.stdout()
    const error = await result.stderr()
    return { success: result.exitCode === 0, exitCode: result.exitCode, output, error, command }
  }

  if (!Number.isInteger(maxResponseBytes) || maxResponseBytes < 1) {
    throw new Error('maxResponseBytes must be a positive integer')
  }

  const script = [
    'set -o pipefail',
    '_velclaw_tmp=$(mktemp)',
    `${command} | head -c ${maxResponseBytes + 1} > \"$_velclaw_tmp\"`,
    '_velclaw_status=${PIPESTATUS[0]}',
    '_velclaw_bytes=$(wc -c < \"$_velclaw_tmp\")',
    `if [ \"$_velclaw_bytes\" -gt ${maxResponseBytes} ]; then`,
    '  rm -f "$_velclaw_tmp"',
    "  printf '%s\\n' 'CURL_RESPONSE_TOO_LARGE' >&2",
    '  exit 100',
    'fi',
    'cat "$_velclaw_tmp"',
    'rm -f "$_velclaw_tmp"',
    'exit "$_velclaw_status"',
  ].join('\n')

  const result = await sandbox.runCommand('sh', ['-c', script])
  const output = await result.stdout()
  const error = await result.stderr()

  return {
    success: result.exitCode === 0,
    exitCode: result.exitCode,
    output,
    error,
    command: `sh -c ${shellEscape(script)}`,
  }
}
