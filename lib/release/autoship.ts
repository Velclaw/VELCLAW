import type { ReleaseProviderAdapter, ReleaseRecord, ReleaseTriggerInput } from './types'

type AutoshipConfig = {
  baseUrl: string
  token: string
}

function getConfig(): AutoshipConfig {
  return {
    baseUrl: (process.env.AUTOSHIP_API_URL || '').replace(/\/$/, ''),
    token: process.env.AUTOSHIP_API_TOKEN || '',
  }
}

async function request<T>(config: AutoshipConfig, path: string, init?: RequestInit): Promise<T> {
  if (!config.baseUrl) throw new Error('AUTOSHIP_API_URL is not configured')
  if (!config.token) throw new Error('AUTOSHIP_API_TOKEN is not configured')
  const response = await fetch(config.baseUrl + path, {
    ...init,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Bearer ' + config.token,
      ...(init?.headers || {}),
    },
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.error || 'Autoship request failed')
  return payload as T
}

export class AutoshipReleaseProvider implements ReleaseProviderAdapter {
  readonly name = 'autoship' as const

  async trigger(input: ReleaseTriggerInput): Promise<ReleaseRecord> {
    const config = getConfig()
    const projectResponse = await request<{ project: { id: string } }>(config, '/api/projects/upsert', {
      method: 'POST',
      body: JSON.stringify({
        name: input.projectName,
        repoUrl: input.repoUrl,
        branch: input.branch,
        target: input.target || 'static-server',
        framework: input.framework || 'nextjs',
      }),
    })

    const runResponse = await request<{ run: ReleaseRecord }>(config, '/api/pipelines/trigger', {
      method: 'POST',
      body: JSON.stringify({
        projectId: projectResponse.project.id,
        commitSha: input.commitSha,
        branch: input.branch,
        commitMessage: 'deploy: ' + input.projectName,
        author: 'Velclaw',
        triggeredBy: 'velclaw-core',
      }),
    })

    return runResponse.run
  }

  async getRun(runId: string): Promise<ReleaseRecord> {
    const config = getConfig()
    const response = await request<{ run: ReleaseRecord }>(config, '/api/pipelines/' + encodeURIComponent(runId))
    return response.run
  }
}
