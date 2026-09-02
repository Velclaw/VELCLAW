import { cookies } from 'next/headers'
import { HomePageContent } from '@/components/home-page-content'
import { getServerSession } from '@/lib/session/get-server-session'
import { getGitHubStars } from '@/lib/github-stars'
import { getMaxSandboxDuration } from '@/lib/db/settings'
import styles from './velclaw-home.module.css'

export default async function VelclawWorkspacePage() {
  const cookieStore = await cookies()
  const selectedOwner = cookieStore.get('selected-owner')?.value || ''
  const selectedRepo = cookieStore.get('selected-repo')?.value || ''
  const installDependencies = cookieStore.get('install-dependencies')?.value === 'true'
  const keepAlive = cookieStore.get('keep-alive')?.value === 'true'
  const enableBrowser = cookieStore.get('enable-browser')?.value === 'true'

  const session = await getServerSession()

  // Get max sandbox duration for this user (user-specific > global > env var)
  const maxSandboxDuration = await getMaxSandboxDuration(session?.user?.id)
  const maxDuration = parseInt(cookieStore.get('max-duration')?.value || maxSandboxDuration.toString(), 10)

  const stars = await getGitHubStars()

  return (
    <div className={styles.home} data-velclaw-home>
      <HomePageContent
        initialSelectedOwner={selectedOwner}
        initialSelectedRepo={selectedRepo}
        initialInstallDependencies={installDependencies}
        initialMaxDuration={maxDuration}
        initialKeepAlive={keepAlive}
        initialEnableBrowser={enableBrowser}
        maxSandboxDuration={maxSandboxDuration}
        user={session?.user ?? null}
        initialStars={stars}
      />
    </div>
  )
}
