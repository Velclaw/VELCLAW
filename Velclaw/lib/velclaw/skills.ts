export type VelclawSkillAgent = 'claude' | 'codex' | 'copilot' | 'cursor' | 'gemini' | 'opencode' | 'ollama'

export type VelclawSkill = {
  id: string
  name: string
  description: string
  version: string
  status: 'available' | 'planned'
  capabilities: string[]
  agents: VelclawSkillAgent[]
  executorBinding: 'task-executor' | 'review-executor' | 'planned'
  sandbox: 'isolated' | 'planned'
  permissions: string[]
  source: string
}

/**
 * Canonical metadata registry for reusable Velclaw agent capabilities.
 * Skills contain instructions/workflows; they do not contain credentials.
 */
export const VELCLAW_SKILLS: VelclawSkill[] = [
  {
    id: 'velclaw-task-planning',
    name: 'Velclaw Task Planning',
    description:
      'Turns a user task into an explicit execution plan with scope, acceptance criteria and gate requirements.',
    version: '1.0.0',
    status: 'available',
    capabilities: ['task-decomposition', 'acceptance-criteria', 'execution-plan'],
    agents: ['claude', 'codex', 'copilot', 'cursor', 'gemini', 'opencode', 'ollama'],
    executorBinding: 'task-executor',
    sandbox: 'isolated',
    permissions: ['read-task-context', 'read-repository-metadata'],
    source: 'velclaw://skills/velclaw-task-planning',
  },
  {
    id: 'velclaw-code-change',
    name: 'Velclaw Code Change',
    description:
      'Guides repository changes through an isolated workspace while preserving the Velclaw branch and validation rules.',
    version: '1.0.0',
    status: 'available',
    capabilities: ['code-editing', 'branch-workflow', 'validation'],
    agents: ['claude', 'codex', 'copilot', 'cursor', 'gemini', 'opencode', 'ollama'],
    executorBinding: 'task-executor',
    sandbox: 'isolated',
    permissions: ['read-repository', 'write-workspace', 'run-validation'],
    source: 'velclaw://skills/velclaw-code-change',
  },
  {
    id: 'velclaw-pr-review',
    name: 'Velclaw PR Review',
    description:
      'Produces review findings that can feed the Review → Gate stages without bypassing CI or repository policy.',
    version: '1.0.0',
    status: 'available',
    capabilities: ['diff-review', 'findings', 'gate-input'],
    agents: ['claude', 'codex', 'copilot', 'cursor', 'gemini', 'opencode', 'ollama'],
    executorBinding: 'review-executor',
    sandbox: 'isolated',
    permissions: ['read-diff', 'read-checks', 'write-review-findings'],
    source: 'velclaw://skills/velclaw-pr-review',
  },
  {
    id: 'velclaw-github-delivery',
    name: 'Velclaw GitHub Delivery',
    description:
      'Prepares branch, commit, checks and pull-request delivery while keeping GitHub credentials outside skill metadata.',
    version: '1.0.0',
    status: 'available',
    capabilities: ['branch', 'commit', 'checks', 'pull-request'],
    agents: ['claude', 'codex', 'copilot', 'cursor', 'gemini', 'opencode', 'ollama'],
    executorBinding: 'task-executor',
    sandbox: 'isolated',
    permissions: ['read-repository', 'create-branch', 'create-commit', 'create-pull-request'],
    source: 'velclaw://skills/velclaw-github-delivery',
  },
  {
    id: 'velclaw-mcp-operation',
    name: 'Velclaw MCP Operation',
    description:
      'Defines reusable MCP-oriented operations that bind a task to MCP tools/resources without turning MCP into a second task system.',
    version: '1.0.0',
    status: 'available',
    capabilities: ['mcp-tools', 'mcp-resources', 'agent-context'],
    agents: ['claude', 'codex', 'copilot', 'cursor', 'gemini', 'opencode', 'ollama'],
    executorBinding: 'task-executor',
    sandbox: 'isolated',
    permissions: ['read-mcp-config', 'invoke-approved-mcp-capabilities'],
    source: 'velclaw://skills/velclaw-mcp-operation',
  },
  {
    id: 'velclaw-deployment',
    name: 'Velclaw Deployment',
    description:
      'Prepares a validated Velclaw release for the first-party Docker runtime and records runtime-backed deployment evidence.',
    version: '1.1.0',
    status: 'available',
    capabilities: [
      'release-preparation',
      'docker-build',
      'container-runtime',
      'deployment-evidence',
      'preview-validation',
      'production-gate',
    ],
    agents: ['claude', 'codex', 'copilot', 'cursor', 'gemini', 'opencode', 'ollama'],
    executorBinding: 'task-executor',
    sandbox: 'isolated',
    permissions: ['read-task-context', 'read-github-checks', 'read-deployment-status', 'request-deployment'],
    source: 'velclaw://skills/velclaw-deployment',
  },
]

export function getVelclawSkill(id: string) {
  return VELCLAW_SKILLS.find((skill) => skill.id === id)
}

export function isVelclawSkillAgent(value: string): value is VelclawSkillAgent {
  return ['claude', 'codex', 'copilot', 'cursor', 'gemini', 'opencode', 'ollama'].includes(value)
}
