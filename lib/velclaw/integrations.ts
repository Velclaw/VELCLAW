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
  kind: 'agent' | 'reviewer' | 'workspace' | 'skills' | 'docs' | 'network' | 'cloud'
  status: 'planned' | 'available'
  source: string
}

/**
 * Canonical integration registry for Velclaw.
 * Source repositories are references for adapters/modules; they are not copied wholesale.
 */
export const VELCLAW_INTEGRATIONS: VelclawIntegration[] = [
  {
    id: 'gito-review',
    name: 'Gito AI review',
    kind: 'reviewer',
    status: 'planned',
    source: 'zskbot/Gito',
  },
  {
    id: 'ollama-local',
    name: 'Ollama local agent',
    kind: 'agent',
    status: 'available',
    source: 'zskbot/code-ollama',
  },
  {
    id: 'git-worktree',
    name: 'Git worktree isolation',
    kind: 'workspace',
    status: 'planned',
    source: 'zskbot/git-worktree-runner',
  },
  {
    id: 'skills',
    name: 'Velclaw skills',
    kind: 'skills',
    status: 'planned',
    source: 'zskbot/skills',
  },
  {
    id: 'claude-skills',
    name: 'Claude skill catalog',
    kind: 'skills',
    status: 'planned',
    source: 'zskbot/awesome-claude-skills',
  },
  {
    id: 'docs',
    name: 'Velclaw documentation',
    kind: 'docs',
    status: 'planned',
    source: 'zskbot/docs-web',
  },
  {
    id: 'curl-network',
    name: 'curl network executor',
    kind: 'network',
    status: 'available',
    source: 'https://curl.se/',
  },
  {
    id: 'mdn-web-platform',
    name: 'MDN Web Platform reference',
    kind: 'docs',
    status: 'available',
    source: 'https://developer.mozilla.org/',
  },
  {
    id: 'ibm-cloud',
    name: 'IBM Cloud provider adapter',
    kind: 'cloud',
    status: 'planned',
    source: 'https://cloud.ibm.com/',
  },
]

export function isVelclawAgent(value: string): value is VelclawAgent {
  return ['claude', 'codex', 'copilot', 'cursor', 'gemini', 'opencode', 'ollama'].includes(value)
}
