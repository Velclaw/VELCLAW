import { getHostingProvider, type HostingDeploymentInput, type HostingDeploymentResult, type HostingProviderAdapter } from './providers'
import { RenderHostingProvider } from './render'

class SelfHostedProvider implements HostingProviderAdapter {
  readonly name = 'self-hosted' as const

  async createDeployment(input: HostingDeploymentInput): Promise<HostingDeploymentResult> {
    const { createDeployment } = await import('@/lib/deploy/store')
    const deployment = await createDeployment(input)
    return {
      provider: 'self-hosted',
      externalId: deployment.id,
      url: deployment.url,
      status: deployment.status,
    }
  }
}

export function getHostingProviderAdapter(): HostingProviderAdapter {
  return getHostingProvider() === 'render' ? new RenderHostingProvider() : new SelfHostedProvider()
}

export async function createHostingDeployment(input: HostingDeploymentInput) {
  return getHostingProviderAdapter().createDeployment(input)
}
