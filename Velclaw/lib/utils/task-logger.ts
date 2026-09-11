import { db } from '@/lib/db/client'
import { tasks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createInfoLog, createCommandLog, createErrorLog, createSuccessLog, LogEntry } from './logging'

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'error' | 'stopped'

export class TaskLogger {
  private taskId: string

  constructor(taskId: string) {
    this.taskId = taskId
  }

  /** Append a log entry to the database immediately. */
  async append(type: 'info' | 'command' | 'error' | 'success', message: string): Promise<void> {
    try {
      let logEntry: LogEntry
      switch (type) {
        case 'info':
          logEntry = createInfoLog(message)
          break
        case 'command':
          logEntry = createCommandLog(message)
          break
        case 'error':
          logEntry = createErrorLog(message)
          break
        case 'success':
          logEntry = createSuccessLog(message)
          break
        default:
          logEntry = createInfoLog(message)
      }

      const currentTask = await db.select().from(tasks).where(eq(tasks.id, this.taskId)).limit(1)
      const existingLogs = currentTask[0]?.logs || []

      await db
        .update(tasks)
        .set({ logs: [...existingLogs, logEntry], updatedAt: new Date() })
        .where(eq(tasks.id, this.taskId))
    } catch {
      // Failed logging must never break task execution.
    }
  }

  async info(message: string): Promise<void> {
    return this.append('info', message)
  }

  async command(message: string): Promise<void> {
    return this.append('command', message)
  }

  async error(message: string): Promise<void> {
    return this.append('error', message)
  }

  async success(message: string): Promise<void> {
    return this.append('success', message)
  }

  /** Update task progress and append the corresponding log entry. */
  async updateProgress(progress: number, message: string): Promise<void> {
    try {
      const boundedProgress = Math.min(100, Math.max(0, Math.round(progress)))
      const logEntry = createInfoLog(message)
      const currentTask = await db.select().from(tasks).where(eq(tasks.id, this.taskId)).limit(1)
      const existingLogs = currentTask[0]?.logs || []

      await db
        .update(tasks)
        .set({ progress: boundedProgress, logs: [...existingLogs, logEntry], updatedAt: new Date() })
        .where(eq(tasks.id, this.taskId))
    } catch {
      // Failed progress logging must never break task execution.
    }
  }

  /** Update task status along with an optional log message. */
  async updateStatus(status: TaskStatus, message?: string): Promise<void> {
    try {
      const updates: { status: TaskStatus; updatedAt: Date; logs?: LogEntry[] } = {
        status,
        updatedAt: new Date(),
      }

      if (message) {
        const logEntry = createInfoLog(message)
        const currentTask = await db.select().from(tasks).where(eq(tasks.id, this.taskId)).limit(1)
        const existingLogs = currentTask[0]?.logs || []
        updates.logs = [...existingLogs, logEntry]
      }

      await db.update(tasks).set(updates).where(eq(tasks.id, this.taskId))
    } catch {
      // Failed status logging must never break task execution.
    }
  }
}

export function createTaskLogger(taskId: string): TaskLogger {
  return new TaskLogger(taskId)
}
