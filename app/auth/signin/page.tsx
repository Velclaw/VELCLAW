import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/session/get-server-session'
import { VelclawSignInPanel } from '@/components/auth/velclaw-sign-in-panel'

export const metadata = {
  title: 'Đăng nhập — Velclaw',
  description: 'Đăng nhập vào Velclaw Workspace.',
}

export default async function SignInPage() {
  const session = await getServerSession()

  if (session?.user) {
    redirect('/')
  }

  return (
    <main className="velclaw-auth-page fixed inset-0 z-[100] min-h-screen overflow-y-auto bg-background px-4 py-6 text-foreground sm:px-6 sm:py-10">
      <div className="velclaw-auth-grid pointer-events-none fixed inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_520px] lg:gap-16">
        <section className="hidden lg:block" aria-hidden="true">
          <div className="mb-6 inline-flex items-center gap-3 border border-border/80 bg-card/70 px-3 py-2 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,.9)]" />
            Velclaw Identity
          </div>
          <h2 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em]">
            Một workspace cho <span className="text-violet-300">code, agents và deploy.</span>
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">
            Đăng nhập một lần để truy cập workspace AI-native, quản lý dự án, chạy agent, review thay đổi và đưa ứng dụng lên môi trường triển khai.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-2 gap-px border border-border bg-border">
            {['Code', 'Agents', 'Builds', 'Deploy'].map((item) => (
              <div key={item} className="bg-background/95 p-5">
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">{item}</div>
                <div className="mt-2 h-px w-10 bg-violet-400/60" />
              </div>
            ))}
          </div>
        </section>

        <section className="w-full border border-border/80 bg-background/95 p-5 shadow-2xl shadow-violet-950/20 backdrop-blur-xl sm:p-10">
          <VelclawSignInPanel />
        </section>
      </div>
    </main>
  )
}
