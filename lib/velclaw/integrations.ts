export type VelclawAgent =
  | 'claude'
  | 'codex'
  | 'copilot'
  | 'cursor'
  | 'gemini'
  | 'opencode'
  | 'ollama'

export type VelclawIntegration = {
  id: string
  name: string
  kind: 'agent' | 'reviewer' | 'workspace' | 'skills' | 'docs' | 'network' | 'cloud' | 'source-control' | 'identity'
  status: 'planned' | 'available'
  source: string
  capabilities?: string[]
}

/**
 * Canonical integration registry for Velclaw.
 * Source repositories are references for adapters/modules; they are not copied wholesale.
 * Planned entries are capability boundaries only until a real adapter and runtime path exist.
 */
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
    id: 'gitlab-cloud',
    name: 'GitLab Cloud',
    kind: 'source-control',
    status: 'planned',
    source: 'https://gitlab.com/',
    capabilities: ['oauth', 'repositories', 'merge-requests', 'pipelines'],
  },
  {
    id: 'bitbucket-cloud',
    name: 'Bitbucket Cloud',
    kind: 'source-control',
    status: 'planned',
    source: 'https://bitbucket.org/',
    capabilities: ['oauth', 'repositories', 'pull-requests', 'pipelines'],
  },
  {
    id: 'azure-devops',
    name: 'Azure DevOps',
    kind: 'source-control',
    status: 'planned',
    source: 'https://dev.azure.com/',
    capabilities: ['entra-oauth', 'repositories', 'pull-requests', 'builds'],
  },
  {
    id: 'gito-review',
    name: 'Gito AI review',
    kind: 'reviewer',
    status: 'planned',
    source: 'zskbot/Gito',
    capabilities: ['review', 'findings', 'gate-input'],
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
    name: 'Velclaw skills',
    kind: 'skills',
    status: 'planned',
    source: 'zskbot/skills',
    capabilities: ['skill-discovery', 'skill-execution'],
  },
  {
    id: 'claude-skills',
    name: 'Claude skill catalog',
    kind: 'skills',
    status: 'planned',
    source: 'zskbot/awesome-claude-skills',
    capabilities: ['catalog', 'skill-metadata'],
  },
  {
    id: 'mcp-runtime',
    name: 'MCP runtime',
    kind: 'skills',
    status: 'planned',
    source: 'https://modelcontextprotocol.io/',
    capabilities: ['tools', 'resources', 'prompts'],
  },
  {
    id: 'docs',
    name: 'Velclaw documentation',
    kind: 'docs',
    status: 'planned',
    source: 'zskbot/docs-web',
    capabilities: ['reference', 'guides', 'ecosystem'],
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
