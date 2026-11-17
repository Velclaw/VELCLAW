export type ReleaseTriggerInput = {
  projectName: string
  repoUrl: string
  branch: string
  commitSha: string
  target?: string
  framework?: string
}

export type ReleaseRecord = {
  id: string
  projectId: string
  status: string
  branch: string
  commitSha: string
  deployedUrl?: string
  startedAt?: string
  completedAt?: string
  errorMessage?: string
}

export interface ReleaseProviderAdapter {
  readonly name: 'autoship'
  trigger(input: ReleaseTriggerInput): Promise<ReleaseRecord>
  getRun(runId: string): Promise<ReleaseRecord>
}
