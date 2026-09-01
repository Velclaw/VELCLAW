import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session/get-server-session'
import { VelclawSignInPanel } from '@/components/auth/velclaw-sign-in-panel'

export default async function SignInPage() {
  const session = await getServerSession()

  if (session?.user) {
    redirect('/')
  }

  return (
    <main className="velclaw-auth-page fixed inset-0 z-[100] min-h-screen overflow-y-auto bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="velclaw-auth-grid pointer-events-none fixed inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <section className="w-full max-w-xl border border-border/80 bg-background/95 p-6 shadow-2xl shadow-violet-950/20 backdrop-blur sm:p-10">
          <VelclawSignInPanel />
        </section>
      </div>
    </main>
  )
}
