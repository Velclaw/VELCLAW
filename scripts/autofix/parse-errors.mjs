import crypto from 'node:crypto'

const ANSI = /\u001b\[[0-?]*[ -/]*[@-~]/g

function clean(value) {
  return value.replace(ANSI, '').replace(/\r/g, '')
}

function fingerprint(error) {
  return crypto
    .createHash('sha256')
    .update(`${error.file}|${error.line}|${error.column}|${error.code}|${error.message}`)
    .digest('hex')
    .slice(0, 16)
}

export function parseErrors(rawLogs) {
  const logs = clean(rawLogs)
  const errors = []
  const seen = new Set()
  const patterns = [
    /(?<file>[^\s:][^\n:]*\.(?:ts|tsx|js|jsx|mjs|cjs)):(?<line>\d+):(?<column>\d+)\s+-?\s*(?<message>.+)/g,
    /(?<file>[^\s:][^\n:]*\.(?:ts|tsx|js|jsx|mjs|cjs))\((?<line>\d+),(?<column>\d+)\):\s*(?<message>.+)/g,
    /##\[error\]\s*(?<message>.+)/g,
  ]

  for (const pattern of patterns) {
    for (const match of logs.matchAll(pattern)) {
      const file = match.groups?.file?.trim() || null
      const line = match.groups?.line ? Number(match.groups.line) : null
      const column = match.groups?.column ? Number(match.groups.column) : null
      const message = match.groups?.message?.trim() || 'GitHub Actions reported an error.'
      const codeMatch = message.match(/\b(TS\d{4}|ESLint|Error|FAIL|ERR_[A-Z0-9_]+)\b/)
      const error = { file, line, column, code: codeMatch?.[1] || 'CI_FAILURE', message }
      const id = fingerprint(error)
      if (!seen.has(id)) {
        seen.add(id)
        errors.push({ ...error, fingerprint: id })
      }
    }
  }

  if (errors.length === 0) {
    const lines = logs.split('\n').filter((line) => /error|failed|failure|ERR!/i.test(line)).slice(-30)
    for (const message of lines) {
      const error = { file: null, line: null, column: null, code: 'CI_FAILURE', message: message.trim() }
      const id = fingerprint(error)
      if (!seen.has(id)) {
        seen.add(id)
        errors.push({ ...error, fingerprint: id })
      }
    }
  }

  return errors.slice(0, 20)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = await new Promise((resolve) => {
    let value = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => (value += chunk))
    process.stdin.on('end', () => resolve(value))
  })
  process.stdout.write(`${JSON.stringify(parseErrors(input), null, 2)}\n`)
}
