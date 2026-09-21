export const ECOSYSTEM_PROJECTS = [
  { id: 'core', name: 'Velclaw Core', role: 'Canonical workspace', path: '/', status: 'active', href: '/' },
  { id: 'hub', name: 'VelclawHub', role: 'Skills, plugins & ecosystem discovery', path: '/velclawhub', status: 'active', href: '/velclawhub' },
  { id: 'deploy', name: 'VelclawDeploy', role: 'Build & deployment control plane', path: '/deploy', status: 'active', href: '/deploy' },
  { id: 'skills', name: 'Skills', role: 'Agent capability catalog', path: '/skills', status: 'active', href: '/skills' },
  { id: 'plugins', name: 'Plugins', role: 'Workspace extension catalog', path: '/plugins', status: 'active', href: '/plugins' },
  { id: 'mcp', name: 'MCP', role: 'Tools & context integration', path: '/mcp', status: 'active', href: '/mcp' },
  { id: 'workspace', name: 'Workspace', role: 'Project files, agents, review & runtime', path: '/velclaw', status: 'active', href: '/velclaw' },
  { id: 'autoship', name: 'Autoship', role: 'External continuous delivery surface', path: 'autoship.velclaw.cfd', status: 'external', href: 'https://autoship.velclaw.cfd' },
] as const

export const ECOSYSTEM_LIFECYCLE = [
  'Task',
  'Workspace',
  'Agent',
  'Plan / Edit',
  'Test',
  'Review',
  'Gate',
  'Git / PR',
  'Build',
  'Artifact',
  'Deploy',
  'Health / Routing',
  'Observe',
] as const

export type EcosystemProject = (typeof ECOSYSTEM_PROJECTS)[number]
