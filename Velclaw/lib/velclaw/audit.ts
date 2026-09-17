export type VelclawAuditEvent = {
  taskId: string
  action: 'task.created' | 'agent.started' | 'agent.completed' | 'review.completed' | 'gate.evaluated' | 'pr.created'
  actorId?: string
  metadata?: Record<string, string>
  timestamp: string
}

const events: VelclawAuditEvent[] = []

export function recordAuditEvent(event: VelclawAuditEvent): void {
  events.push({ ...event, metadata: event.metadata ? { ...event.metadata } : undefined })
}

export function getAuditEvents(taskId: string): VelclawAuditEvent[] {
  return events.filter((event) => event.taskId === taskId)
}
