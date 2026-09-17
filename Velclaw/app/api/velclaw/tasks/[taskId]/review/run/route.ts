import { NextResponse } from 'next/server'
import { Sandbox } from '@vercel/sandbox'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { tasks } from '@/lib/db/schema'
import { getServerSession } from '@/lib/session/get-server-session'
import { runGitoReview } from '@/lib/velclaw/gito'
import { setReviewSnapshot } from '@/lib/velclaw/review-store'
import { evaluateReviewGate } from '@/lib/velclaw/review'

interface Props {
  params: Promise<{ taskId: string }>
}

export async function POST(_request: Request, { params }: Props) {
  try {
    const { taskId } = await params
    const session = await getServerSession()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [task] = await db
      .select({ id: tasks.id, sandboxId: tasks.sandboxId, selectedModel: tasks.selectedModel })
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id), isNull(tasks.deletedAt)))
      .limit(1)

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    if (!task.sandboxId) return NextResponse.json({ error: 'Task has no sandbox to review' }, { status: 409 })

    await setReviewSnapshot({
      taskId,
      findings: [],
      checksPassing: false,
      status: 'running',
      updatedAt: new Date().toISOString(),
    })

    const sandbox = await Sandbox.get({ sandboxId: task.sandboxId })
    const result = await runGitoReview(sandbox, { model: task.selectedModel ?? undefined })
    const gate = evaluateReviewGate(result.findings)
    const snapshot = await setReviewSnapshot({
      taskId,
      findings: result.findings,
      checksPassing: false,
      status: result.success ? (gate.passed ? 'passed' : 'blocked') : 'failed',
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: result.success, snapshot, report: result.report, error: result.error })
  } catch (error) {
    console.error('Velclaw Gito review failed:', error)
    return NextResponse.json({ error: 'Failed to run Gito review' }, { status: 500 })
  }
}
