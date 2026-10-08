import type { HostingDeploymentInput, HostingDeploymentResult, HostingProviderAdapter } from './providers'

type VelclawHostDeployment = {
  id: string
  projectName: string
  repoUrl: string
  branch: string
  commitSha: string | null
  customDomain: string | null
  status: HostingDeploymentResult['status']
  createdAt: string
}

export class VelclawHostProvider implements HostingProviderAdapter {
  readonly name = 'velclawhost' as const

  private getConfig() {
    return {
      baseUrl: (process.env.VELCLAWHOST_API_URL || '').replace(/\/$/, ''),
      token: process.env.VELCLAWHOST_API_TOKEN || '',
    }
  }

  async createDeployment(input: HostingDeploymentInput): Promise<HostingDeploymentResult> {
    const { baseUrl, token } = this.getConfig()
    if (!baseUrl) throw new Error('VELCLAWHOST_API_URL is not configured')
    if (!token) throw new Error('VELCLAWHOST_API_TOKEN is not configured')

    const response = await fetch(baseUrl + '/api/v1/deployments', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        projectName: input.projectName,
        repoUrl: input.repoUrl,
        branch: input.branch,
        commitSha: input.commitSha || null,
        customDomain: input.customDomain || null,
      }),
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload?.deployment) {
      throw new Error(payload?.error || 'VelclawHost deployment request failed')
    }

    const deployment = payload.deployment as VelclawHostDeployment
    return {
      provider: 'velclawhost',
      externalId: deployment.id,
      url: input.customDomain ? 'https://' + input.customDomain : null,
      status: deployment.status,
    }
  }

  async getDeployment(externalId: string): Promise<HostingDeploymentResult> {
    const { baseUrl, token } = this.getConfig()
    if (!baseUrl || !token) throw new Error('VelclawHost provider is not configured')

    const response = await fetch(baseUrl + '/api/v1/deployments/' + encodeURIComponent(externalId), {
      headers: { authorization: 'Bearer ' + token },
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok || !payload?.deployment) {
      throw new Error(payload?.error || 'VelclawHost deployment lookup failed')
    }

    const deployment = payload.deployment as VelclawHostDeployment
    return {
      provider: 'velclawhost',
      externalId: deployment.id,
      url: deployment.customDomain ? 'https://' + deployment.customDomain : null,
      status: deployment.status,
    }
  }
}
