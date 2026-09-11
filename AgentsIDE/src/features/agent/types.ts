export type TaskStatus =
  | 'idle'
  | 'planning'
  | 'executing'
  | 'testing'
  | 'review'
  | 'complete'
  | 'error'

export type ChangeKind = 'modified' | 'added' | 'deleted'

export interface FileChange {
  path: string
  kind: ChangeKind
  before: string
  after: string
}

export interface AgentTask {
  id: string
  prompt: string
  status: TaskStatus
  plan: string[]
  changes: FileChange[]
  logs: string[]
  createdAt: string
  error?: string
}
