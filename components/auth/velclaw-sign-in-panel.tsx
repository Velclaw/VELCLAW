'use client'

import { GitHubIcon } from '@/components/icons/github-icon'
import { Button } from '@/components/ui/button'
import { getEnabledAuthProviders } from '@/lib/auth/providers'
import { Loader2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

type ProviderRowProps = {
  label: string
  icon: React.ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  available?: boolean
}

function ProviderRow({ label, icon, onClick, loading, disabled, available = true }: ProviderRowProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={disabled || loading}
      className="velclaw-auth-provider h-14 w-full justify-between border-border/80 bg-card/70 px-4 text-left hover:border-violet-400/70 hover:bg-violet-500/5 disabled:cursor-not-allowed disabled:opacity-55"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-background/80 text-foreground">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        </span>
        <span className="truncate text-sm font-medium">{label}</span>
      </span>
      <span
        className={`h-2 w-2 shrink-0 ${available ? 'bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]' : 'bg-muted-foreground/40'}`}
        aria-label={available ? 'Available' : 'Not configured'}
      />
    </Button>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z" />
      <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.75 9.75 0 0 0 12 21.75Z" />
      <path fill="#FBBC05" d="M6.54 13.83A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.64H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.36l3.25-2.53Z" />
      <path fill="#EA4335" d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.2 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.39l3.25 2.53C7.31 7.86 9.46 6.14 12 6.14Z" />
    </svg>
  )
}

function ChatGPTIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 9.1a5.1 5.1 0 0 0-7.4-4.4 5.1 5.1 0 0 0-8.9 4.4 5.1 5.1 0 0 0 2.6 8.4 5.1 5.1 0 0 0 8.8 1.8 5.1 5.1 0 0 0 7.3-4.5 5.1 5.1 0 0 0-.4-5.7Z" />
      <path d="m8.1 7.1 7.8 4.5M8.1 16.9l7.8-4.5M12 4.7v14.6" />
    </svg>
  )
}

export function VelclawSignInPanel({ compact = false }: { compact?: boolean }) {
  const { github: hasGitHub } = getEnabledAuthProviders()
  const [loading, setLoading] = useState<'github' | null>(null)

  const signInGitHub = () => {
    setLoading('github')
    window.location.href = '/api/auth/signin/github'
  }

  return (
    <div className={compact ? 'w-full' : 'w-full max-w-md'}>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-violet-400/30 bg-violet-500/5 shadow-[0_0_50px_rgba(124,58,237,.16)]">
          <img src="/brand/velclaw-mark.svg" alt="" className="h-11 w-11 object-contain" />
        </div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.32em] text-violet-300">VELCLAW IDENTITY</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Chào mừng trở lại</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Đăng nhập để tiếp tục vào workspace AI-native của Velclaw.
        </p>
      </div>

      <div className="space-y-3">
        <ProviderRow
          label="Tiếp tục với GitHub"
          icon={<GitHubIcon className="h-4 w-4" />}
          onClick={hasGitHub ? signInGitHub : undefined}
          loading={loading === 'github'}
          disabled={!hasGitHub}
          available={hasGitHub}
        />
        <ProviderRow label="Tiếp tục với Google" icon={<GoogleIcon />} disabled available={false} />
        <ProviderRow label="Tiếp tục với ChatGPT" icon={<ChatGPTIcon />} disabled available={false} />
      </div>

      <div className="mt-6 flex items-start gap-3 border border-border/70 bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
        <span>GitHub là phương thức đăng nhập production hiện đã được nối với Velclaw Identity. Google và ChatGPT chỉ bật sau khi callback OAuth tương ứng được cấu hình.</span>
      </div>

      <div className="my-6 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground/60">
        <span className="h-px flex-1 bg-border" />
        <span>Secure access</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
        Code · Agents · Builds · Runtime · Review · Deploy
      </p>
    </div>
  )
}
