import { getRenderConfig, type HostingDeploymentInput, type HostingDeploymentResult, type HostingProviderAdapter } from './providers'

export class RenderHostingProvider implements HostingProviderAdapter {
  readonly name = 'render' as const

  async createDeployment(input: HostingDeploymentInput): Promise<HostingDeploymentResult> {
    const { apiUrl, apiKey } = getRenderConfig()
    if (!apiKey) {
      throw new Error('RENDER_API_KEY is required when VELCLAW_HOSTING_PROVIDER=render')
    }

    const serviceId = process.env.RENDER_SERVICE_ID
    if (!serviceId) throw new Error('RENDER_SERVICE_ID is required for the Render provider')

    const configuredRepo = process.env.RENDER_REPOSITORY_URL?.trim()
    const configuredBranch = process.env.RENDER_BRANCH?.trim() || 'main'
    if (!configuredRepo) {
      throw new Error('RENDER_REPOSITORY_URL is required for the Render provider')
    }
    if (input.repoUrl !== configuredRepo || input.branch !== configuredBranch) {
      throw new Error('Render provider is configured for a single repository and branch; use self-hosted for arbitrary projects')
    }

    const response = await fetch(`${apiUrl}/v1/services/${encodeURIComponent(serviceId)}/deploys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clearCache: 'do_not_clear' }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Render deployment request failed (${response.status}): ${body.slice(0, 500)}`)
    }

    const deployment = (await response.json()) as { id?: string }
    return {
      provider: 'render',
      externalId: deployment.id || null,
      url: process.env.RENDER_PUBLIC_URL || null,
      status: 'queued',
    }
  }
}
