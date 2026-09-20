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

function configPath() {
  return path.join(process.cwd(), 'config', 'mcp.json')
}

function readConfig(): RawConfig {
  const file = fs.readFileSync(configPath(), 'utf8')
  return JSON.parse(file) as RawConfig
}

function resolveEnv(value: string) {
  return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, key: string) => process.env[key] || '')
}

function findRequiredEnv(values: Iterable<string>) {
  const required = new Set<string>()
  for (const value of values) {
    for (const match of value.matchAll(/\$\{([A-Z0-9_]+)\}/g)) {
      required.add(match[1])
    }
  }
  return [...required]
}

export function loadMcpRegistry(): McpServerDefinition[] {
  const config = readConfig()

  return Object.entries(config.mcpServers || {}).map(([id, server]) => ({
    id,
    type: server.type === 'http' || server.type === 'sse' || server.url ? 'remote' : 'local',
    command: server.command,
    args: server.args,
    url: server.url,
    env: Object.fromEntries(Object.entries(server.env || {}).map(([key, value]) => [key, resolveEnv(value)])),
    headers: Object.fromEntries(Object.entries(server.headers || {}).map(([key, value]) => [key, resolveEnv(value)])),
    disabled: server.disabled === true,
  }))
}

export function getMcpRuntimeStatus(): McpRuntimeStatus[] {
  const config = readConfig()
  const loaded = loadMcpRegistry()

  return Object.entries(config.mcpServers || {}).map(([id, server]) => {
    const requiredEnv = findRequiredEnv([
      ...Object.values(server.env || {}),
      ...Object.values(server.headers || {}),
    ])
    const configuredEnv = requiredEnv.filter((key) => Boolean(process.env[key]))

    let state: McpRuntimeStatus['state'] = 'ready'
    if (server.disabled === true) state = 'disabled'
    else if (configuredEnv.length !== requiredEnv.length) state = 'missing-env'

    const definition = loaded.find((item) => item.id === id)!

    return {
      ...definition,
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
