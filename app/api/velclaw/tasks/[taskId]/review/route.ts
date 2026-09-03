import { NextResponse } from 'next/server'
import { eq, and } from 'drizzle-orm'
import { getServerSession } from '@/lib/session/get-server-session'
import { db } from '@/lib/db/client'
import { tasks } from '@/lib/db/schema'
import { getReviewSnapshot } from '@/lib/velclaw/review-store'
import { getPullRequestChecks } from '@/lib/github/client'

interface Props {
  params: Promise<{ taskId: string }>
}

export async function GET(_request: Request, { params }: Props) {
  const { taskId } = await params
  const session = await getServerSession()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [task] = await db
    .select({ id: tasks.id, repoUrl: tasks.repoUrl, prNumber: tasks.prNumber })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id)))
    .limit(1)
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  const snapshot = await getReviewSnapshot(taskId)
  let checks: Awaited<ReturnType<typeof getPullRequestChecks>> | null = null
  if (task.repoUrl && task.prNumber)
    checks = await getPullRequestChecks({ repoUrl: task.repoUrl, prNumber: task.prNumber })

  const findings = snapshot?.findings ?? []
  const checksPassing = checks?.success ? Boolean(checks.passing) : false
  const blockingFindings = findings.filter((finding) => finding.severity === 'critical' || finding.severity === 'high')
  const gate =
    snapshot && checks?.success && checksPassing && blockingFindings.length === 0
      ? 'passed'
      : snapshot
        ? 'blocked'
        : 'pending'

  return NextResponse.json({
    taskId,
    findings,
    gate,
    checksPassing,
    checks: checks?.success ? checks.checks : [],
    checksPending: checks?.success ? checks.pending : true,
    headSha: checks?.success ? checks.headSha : undefined,
    blockingFindings,
    reviewAvailable: Boolean(snapshot),
    updatedAt: snapshot?.updatedAt,
  })
}
