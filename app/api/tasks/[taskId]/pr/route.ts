import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { tasks } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { getServerSession } from '@/lib/session/get-server-session'
import { createPullRequest } from '@/lib/github/client'
import { getReviewSnapshot } from '@/lib/velclaw/review-store'
import { evaluateReviewGate } from '@/lib/velclaw/review'

interface RouteParams {
  params: Promise<{ taskId: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { taskId } = await params
    const body = await request.json().catch(() => ({}))

    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id), isNull(tasks.deletedAt)))
      .limit(1)

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    if (!task.repoUrl || !task.branchName) {
      return NextResponse.json({ error: 'Task does not have repository or branch information' }, { status: 400 })
    }

    if (task.prUrl) {
      return NextResponse.json({ success: true, data: { prUrl: task.prUrl, prNumber: task.prNumber, alreadyExists: true } })
    }

    const snapshot = await getReviewSnapshot(taskId)
    if (!snapshot) {
      return NextResponse.json({ error: 'Review gate is pending: run Gito review before creating a PR' }, { status: 409 })
    }

    if (snapshot.status !== 'passed') {
      return NextResponse.json({ error: `Review gate is ${snapshot.status}; PR creation requires a completed passing review` }, { status: 409 })
    }

    if (!snapshot.checksPassing) {
      return NextResponse.json({ error: 'Review gate blocked pull request creation: required checks are not passing' }, { status: 422 })
    }

    const gate = evaluateReviewGate(snapshot.findings)
    if (!gate.passed) {
      return NextResponse.json({ error: 'Review gate blocked pull request creation', blockingFindings: gate.blockingFindings }, { status: 422 })
    }

    const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : task.title?.trim() || 'Velclaw changes'
    const prBody = typeof body.body === 'string' ? body.body : `Created by Velclaw after Gito review for task ${taskId}.`
    const baseBranch = typeof body.baseBranch === 'string' && body.baseBranch.trim() ? body.baseBranch.trim() : 'main'

    const result = await createPullRequest({ repoUrl: task.repoUrl, branchName: task.branchName, title, body: prBody, baseBranch })
    if (!result.success) return NextResponse.json({ error: result.error || 'Failed to create pull request' }, { status: 502 })

    const [updatedTask] = await db
      .update(tasks)
      .set({ prUrl: result.prUrl, prNumber: result.prNumber, prStatus: 'open', updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning()

    return NextResponse.json({ success: true, data: { prUrl: result.prUrl, prNumber: result.prNumber, task: updatedTask } })
  } catch (error) {
    console.error('Error creating pull request:', error)
    return NextResponse.json({ error: 'Failed to create pull request' }, { status: 500 })
  }
}
