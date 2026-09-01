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

  if (method !== 'GET') args.push('--request', method)
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
