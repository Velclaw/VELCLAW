export type VelclawAgent = 'claude' | 'codex' | 'copilot' | 'cursor' | 'gemini' | 'opencode' | 'ollama'

export type VelclawIntegration = {
  id: string
  name: string
  kind: 'agent' | 'reviewer' | 'workspace' | 'skills' | 'docs' | 'network' | 'cloud' | 'source-control' | 'identity'
  status: 'planned' | 'available'
  source: string
  capabilities?: string[]
}

/** Only integrations that materially help the current Velclaw workflow are kept here. */
export const VELCLAW_INTEGRATIONS: VelclawIntegration[] = [
  {
    id: 'github-cloud',
    name: 'GitHub Cloud',
    kind: 'source-control',
    status: 'available',
    source: 'https://github.com/',
    capabilities: ['oauth', 'repositories', 'branches', 'pull-requests', 'checks'],
  },
  {
    id: 'vercel-cloud',
    name: 'Vercel Cloud',
    kind: 'identity',
    status: 'available',
    source: 'https://vercel.com/',
    capabilities: ['oauth', 'workspace-auth'],
  },
  {
    id: 'mcp-runtime',
    name: 'MCP runtime',
    kind: 'skills',
    status: 'available',
    source: 'https://modelcontextprotocol.io/',
    capabilities: ['tools', 'resources', 'prompts', 'agent-context'],
  },
  {
    id: 'gito-review',
    name: 'Gito AI review',
    kind: 'reviewer',
    status: 'available',
    source: 'zskbot/Gito',
    capabilities: ['review', 'findings', 'gate-input', 'optional-review'],
  },
  {
    id: 'ollama-local',
    name: 'Ollama local agent',
    kind: 'agent',
    status: 'available',
    source: 'zskbot/code-ollama',
    capabilities: ['local-models', 'agent-execution'],
  },
  {
    id: 'git-worktree',
    name: 'Git worktree isolation',
    kind: 'workspace',
    status: 'planned',
    source: 'zskbot/git-worktree-runner',
    capabilities: ['isolated-worktrees', 'parallel-tasks'],
  },
  {
    id: 'skills',
    name: 'Velclaw Skills',
    kind: 'skills',
    status: 'available',
    source: 'velclaw://skills',
    capabilities: ['skill-discovery', 'skill-metadata', 'executor-binding', 'sandbox-boundary'],
  },
  {
    id: 'curl-network',
    name: 'curl network executor',
    kind: 'network',
    status: 'available',
    source: 'https://curl.se/',
    capabilities: ['http', 'https', 'sandboxed-execution'],
  },
  {
    id: 'mdn-web-platform',
    name: 'MDN Web Platform reference',
    kind: 'docs',
    status: 'available',
    source: 'https://developer.mozilla.org/',
    capabilities: ['web-platform', 'reference-resolution', 'search'],
  },
  {
    id: 'ibm-cloud',
    name: 'IBM Cloud provider adapter',
    kind: 'cloud',
    status: 'planned',
    source: 'https://cloud.ibm.com/',
    capabilities: ['bearer-auth', 'service-api', 'cloud-runtime'],
  },
]

export function isVelclawAgent(value: string): value is VelclawAgent {
  return ['claude', 'codex', 'copilot', 'cursor', 'gemini', 'opencode', 'ollama'].includes(value)
}
