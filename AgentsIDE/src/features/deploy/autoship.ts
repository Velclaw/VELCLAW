export type AutoshipProject = {
  id: string
  name: string
  repoUrl: string
  branch: string
  target: string
  autoDeployOnPush: boolean
  lastDeployStatus?: string
  totalBuilds?: number
}

export type AutoshipRun = {
  id: string
  projectId: string
  status: string
  commitMessage: string
  branch: string
  triggeredBy: string
  deployedUrl?: string
  startedAt: string
  completedAt?: string
  errorMessage?: string
}

const configuredBaseUrl = (import.meta.env.VITE_AUTOSHIP_URL as string | undefined)?.trim()
export const AUTOSHIP_URL = (configuredBaseUrl || 'https://autoship-control-plane-gateway.nvht25052002.workers.dev').replace(/\/$/, '')

export class AutoshipConnectionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AutoshipConnectionError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${AUTOSHIP_URL}${path}`, {
      ...init,
      mode: 'cors',
      credentials: 'omit',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(init?.headers || {}) },
    })
    const contentType = response.headers.get('content-type') || ''
    if (!response.ok) {
      const body = contentType.includes('application/json') ? await response.text() : ''
      throw new AutoshipConnectionError(`Autoship ${response.status}${body ? `: ${body.slice(0, 180)}` : ''}`)
    }
    if (!contentType.includes('application/json')) throw new AutoshipConnectionError('Autoship returned a non-JSON response (authentication or proxy may be active).')
    return response.json() as Promise<T>
  } catch (error) {
    if (error instanceof AutoshipConnectionError) throw error
    throw new AutoshipConnectionError(`Cannot reach Autoship API at ${AUTOSHIP_URL}. Check CORS/network access.`)
  }
}

export async function getAutoshipProjects(): Promise<AutoshipProject[]> {
  const data = await request<{ projects: AutoshipProject[] }>('/api/projects')
  return data.projects
}

export async function getAutoshipRun(runId: string): Promise<AutoshipRun> {
  const data = await request<{ run: AutoshipRun }>(`/api/pipelines/${encodeURIComponent(runId)}`)
  return data.run
}

export async function ensureAgentsIDEProject(): Promise<AutoshipProject> {
  const repoUrl = 'https://github.com/zskbot/AgentsIDE'
  const projects = await getAutoshipProjects()
  const existing = projects.find(project => project.repoUrl.replace(/\/$/, '') === repoUrl)
  if (!existing) throw new AutoshipConnectionError('AgentsIDE is not registered in Autoship yet. The GitHub deployment workflow will bootstrap it.')
  return existing
}

export async function triggerAgentsIDEDeploy(projectId: string, commitMessage = 'deploy: AgentsIDE through Autoship') {
  const data = await request<{ run: AutoshipRun }>('/api/pipelines/trigger', {
    method: 'POST',
    body: JSON.stringify({ projectId, commitMessage, branch: 'main', author: 'AgentsIDE', triggeredBy: 'agentside' }),
  })
  return data.run
}
