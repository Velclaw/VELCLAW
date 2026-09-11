import { redirect } from 'next/navigation'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { tasks } from '@/lib/db/schema'
import { getServerSession } from '@/lib/session/get-server-session'
import { VelclawDashboard } from '@/components/velclaw-dashboard'

export default async function VelclawPage() {
  const session = await getServerSession()
  if (!session?.user?.id) redirect('/')

  const userTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, session.user.id), isNull(tasks.deletedAt)))
    .orderBy(desc(tasks.createdAt))
    .limit(50)

  return <VelclawDashboard tasks={userTasks} />
}
