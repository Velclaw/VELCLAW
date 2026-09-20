import fs from 'node:fs'
import path from 'node:path'

export type McpServerDefinition = {
  id: string
  type: 'local' | 'remote'
  command?: string
  args?: string[]
  url?: string
  env: Record<string, string>
  headers: Record<string, string>
  disabled: boolean
}

export type McpRuntimeStatus = McpServerDefinition & {
  state: 'ready' | 'disabled' | 'missing-env'
  requiredEnv: string[]
  configuredEnv: string[]
}

type RawConfig = {
  mcpServers?: Record<
    string,
    {
      type?: 'stdio' | 'http' | 'sse'
      command?: string
      args?: string[]
      url?: string
      env?: Record<string, string>
      headers?: Record<string, string>
      disabled?: boolean
    }
  >
}

const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9_]+/g,
  /github_pat_[A-Za-z0-9_]+/g,
  /sk-[A-Za-z0-9_-]+/g,
  /-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g,
]

function configPath() {
  return path.join(process.cwd(), 'config', 'mcp.json')
}

function readConfig(): RawConfig {
  const file = fs.readFileSync(configPath(), 'utf8')
  return JSON.parse(file) as RawConfig
}

function resolveEnv(value: string): { value: string; requiredEnv?: string } {
  const match = value.match(/^\$\{([A-Z0-9_]+)\}$/)
  if (!match) return { value }
  return {
    value: process.env[match[1]] || '',
    requiredEnv: match[1],
  }
}

function sanitize(value: string) {
  return SECRET_PATTERNS.reduce((current, pattern) => current.replace(pattern, '[REDACTED]'), value)
}

export function loadMcpRegistry(): McpServerDefinition[] {
  const config = readConfig()

  return Object.entries(config.mcpServers || {}).map(([id, server]) => {
    const env: Record<string, string> = {}
    const headers: Record<string, string> = {}

    for (const [key, value] of Object.entries(server.env || {})) {
      env[key] = sanitize(resolveEnv(value).value)
    }

    for (const [key, value] of Object.entries(server.headers || {})) {
      headers[key] = sanitize(resolveEnv(value).value)
    }

    return {
      id,
      type: server.type === 'http' || server.type === 'sse' || server.url ? 'remote' : 'local',
      command: server.command,
      args: server.args,
      url: server.url,
      env,
      headers,
      disabled: server.disabled === true,
    }
  })
}

export function getMcpRuntimeStatus(): McpRuntimeStatus[] {
  const config = readConfig()

  return Object.entries(config.mcpServers || {}).map(([id, server]) => {
    const required = new Set<string>()
    const collect = (value: string | undefined) => {
      if (!value) return
      const match = value.match(/^\$\{([A-Z0-9_]+)\}$/)
      if (match) required.add(match[1])
    }

    Object.values(server.env || {}).forEach(collect)
    Object.values(server.headers || {}).forEach(collect)

    const requiredEnv = [...required]
    const configuredEnv = requiredEnv.filter((key) => Boolean(process.env[key]))

    let state: McpRuntimeStatus['state'] = 'ready'
    if (server.disabled === true) state = 'disabled'
    else if (configuredEnv.length !== requiredEnv.length) state = 'missing-env'

    const loaded = loadMcpRegistry().find((item) => item.id === id)!

    return {
      ...loaded,
      env: {},
      headers: {},
      state,
      requiredEnv,
      configuredEnv,
    }
  })
}

export function getMcpRuntimeSummary() {
  const servers = getMcpRuntimeStatus()
  return {
    total: servers.length,
    ready: servers.filter((server) => server.state === 'ready').length,
    disabled: servers.filter((server) => server.state === 'disabled').length,
    missingEnv: servers.filter((server) => server.state === 'missing-env').length,
    servers,
  }
}
