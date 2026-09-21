import { AutoshipReleaseProvider } from './autoship'
import type { ReleaseProviderAdapter } from './types'

export function getReleaseProvider(): ReleaseProviderAdapter {
  const provider = (process.env.VELCLAW_RELEASE_PROVIDER || 'autoship').toLowerCase()
  if (provider !== 'autoship') throw new Error('Unsupported release provider: ' + provider)
  return new AutoshipReleaseProvider()
}
