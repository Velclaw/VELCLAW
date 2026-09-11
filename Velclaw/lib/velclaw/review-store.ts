import { eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { taskMessages } from '@/lib/db/schema'
import type { ReviewFinding } from './review'

export type ReviewSnapshot = {
  taskId: string
  findings: ReviewFinding[]
  checksPassing: boolean
  status: 'pending' | 'running' | 'passed' | 'blocked' | 'failed'
  updatedAt: string
}

const PREFIX = '[velclaw-review] '

export async function setReviewSnapshot(snapshot: ReviewSnapshot): Promise<ReviewSnapshot> {
  const content = PREFIX + JSON.stringify(snapshot)
  await db.insert(taskMessages).values({
    id: crypto.randomUUID(),
    taskId: snapshot.taskId,
    role: 'agent',
    content,
  })
  return snapshot
}

export async function getReviewSnapshot(taskId: string): Promise<ReviewSnapshot | null> {
  const rows = await db
    .select({ content: taskMessages.content })
    .from(taskMessages)
    .where(eq(taskMessages.taskId, taskId))
    .orderBy(desc(taskMessages.createdAt))
    .limit(50)

  for (const row of rows) {
    if (!row.content.startsWith(PREFIX)) continue
    try {
      return JSON.parse(row.content.slice(PREFIX.length)) as ReviewSnapshot
    } catch {
      return null
    }
  }
  return null
}
