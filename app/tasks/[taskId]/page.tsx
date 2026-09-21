import { TaskPageClient } from '@/components/task-page-client'
import { getServerSession } from '@/lib/session/get-server-session'
import { getGitHubStars } from '@/lib/github-stars'
import { getMaxSandboxDuration } from '@/lib/db/settings'
import { Metadata } from 'next'

interface TaskPageProps {
  params: Promise<{
    taskId: string
  }>

}

export default async function TaskPage({ params }: TaskPageProps) {
  const { taskId } = await params
  const session = await getServerSession()
  const maxSandboxDuration = await getMaxSandboxDuration(session?.user?.id)
  const stars = await getGitHubStars()

  return (
    <TaskPageClient
      taskId={taskId}
      user={session?.user ?? null}
      authProvider={session?.authProvider ?? null}
      initialStars={stars}
      maxSandboxDuration={maxSandboxDuration}
    />
  )
}

export async function generateMetadata({ params }: TaskPageProps): Promise<Metadata> {
  const { taskId } = await params
  const session = await getServerSession()
  let pageTitle = `Task ${taskId}`

  if (session?.user?.id) {
    try {
      const { db } = await import('@/lib/db/client')
      const { tasks } = await import('@/lib/db/schema')
      const { eq, and, isNull } = await import('drizzle-orm')

      const task = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, session.user.id), isNull(tasks.deletedAt)))
        .limit(1)

      if (task[0]?.title) pageTitle = task[0].title
      else if (task[0]?.prompt) pageTitle = task[0].prompt.length > 60 ? `${task[0].prompt.slice(0, 60)}...` : task[0].prompt
    } catch (error) {
      console.error('Failed to fetch task for metadata:', error)
    }
  }

  return {
    title: `${pageTitle} — Velclaw Workspace`,
    description: 'Velclaw task workspace with code, agent execution, preview, changes, and logs.',
  }
}
