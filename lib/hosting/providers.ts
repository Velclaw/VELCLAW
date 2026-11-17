export type HostingProvider = 'render' | 'self-hosted' | 'velclawhost'

export type HostingDeploymentInput = {
  userId: string
  projectName: string
  repoUrl: string
  branch: string
  commitSha?: string | null
  env?: Record<string, string> | null
  customDomain?: string | null
}

export type HostingDeploymentResult = {
  provider: HostingProvider
  externalId: string | null
  url: string | null
  status: 'queued' | 'building' | 'waiting_approval' | 'ready' | 'failed'
}

export interface HostingProviderAdapter {
  readonly name: HostingProvider
  createDeployment(input: HostingDeploymentInput): Promise<HostingDeploymentResult>
  getDeployment?(externalId: string): Promise<HostingDeploymentResult>
}

export function getHostingProvider(): HostingProvider {
  const provider = (process.env.VELCLAW_HOSTING_PROVIDER || 'self-hosted').toLowerCase()
  if (provider === 'render') return 'render'
  if (provider === 'velclawhost') return 'velclawhost'
  return 'self-hosted'
}

export function getRenderConfig() {
  return {
    apiUrl: (process.env.RENDER_API_URL || 'https://api.render.com').replace(/\/$/, ''),
    apiKey: process.env.RENDER_API_KEY || '',
  }
}
