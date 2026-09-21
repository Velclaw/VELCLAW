import { getHostingProvider, type HostingDeploymentInput, type HostingDeploymentResult, type HostingProviderAdapter } from './providers'
import { RenderHostingProvider } from './render'
import { VelclawHostProvider } from './velclawhost'

class SelfHostedProvider implements HostingProviderAdapter {
  readonly name = 'self-hosted' as const

  async createDeployment(input: HostingDeploymentInput): Promise<HostingDeploymentResult> {
    const { createDeployment } = await import('@/lib/deploy/store')
    const deployment = await createDeployment(input)
    const status: HostingDeploymentResult['status'] =
      deployment.status === 'cancelled' ? 'failed' : deployment.status

    return {
      provider: 'self-hosted',
      externalId: deployment.id,
      url: deployment.url,
      status,
    }
  }
}

export function getHostingProviderAdapter(): HostingProviderAdapter {
  const provider = getHostingProvider()
  if (provider === 'render') return new RenderHostingProvider()
  if (provider === 'velclawhost') return new VelclawHostProvider()
  return new SelfHostedProvider()
}

export async function createHostingDeployment(input: HostingDeploymentInput) {
  return getHostingProviderAdapter().createDeployment(input)
}
