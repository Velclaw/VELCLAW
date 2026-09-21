'use client'

import { GitHubIcon } from '@/components/icons/github-icon'
import { Button } from '@/components/ui/button'
import { getEnabledAuthProviders } from '@/lib/auth/providers'
import { redirectToSignIn } from '@/lib/session/redirect-to-sign-in'
import { Cloud, Loader2 } from 'lucide-react'
import { useState } from 'react'

type ProviderRowProps = {
  label: string
  icon: React.ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
}

function ProviderRow({ label, icon, onClick, loading, disabled }: ProviderRowProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={disabled || loading}
      className="velclaw-auth-provider h-14 w-full justify-between border-border/80 bg-card/70 px-4 text-left hover:border-violet-400/70 hover:bg-violet-500/5"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-background/80 text-foreground">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        </span>
        <span className="truncate text-sm font-medium">{label}</span>
      </span>
      <span className="h-2 w-2 shrink-0 bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]" aria-label="Available" />
    </Button>
  )
}

export function VelclawSignInPanel({ compact = false }: { compact?: boolean }) {
  const { github: hasGitHub, vercel: hasVercel } = getEnabledAuthProviders()
  const [loading, setLoading] = useState<'github' | 'vercel' | null>(null)

  const signInGitHub = () => {
    setLoading('github')
    window.location.href = '/api/auth/signin/github'
  }

  const signInVercel = async () => {
    setLoading('vercel')
    await redirectToSignIn()
  }

  return (
    <div className={compact ? 'w-full' : 'w-full max-w-md'}>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center border border-violet-400/70 bg-[#08070d] shadow-[0_0_34px_rgba(139,92,246,0.22)]">
          <img src="/brand/velclaw-mark.svg" alt="Velclaw" className="h-16 w-16" />
        </div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.28em] text-violet-300">VELCLAW WORKSPACE</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Chào mừng trở lại</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Đăng nhập để tiếp tục vào workspace AI-native của Velclaw.
        </p>
      </div>

      <div className="space-y-3">
        {hasGitHub && (
          <ProviderRow
            label="GitHub Cloud"
            icon={<GitHubIcon className="h-4 w-4" />}
            onClick={signInGitHub}
            loading={loading === 'github'}
          />
        )}
        {hasVercel && (
          <ProviderRow
            label="Vercel Cloud"
            icon={<Cloud className="h-4 w-4" />}
            onClick={signInVercel}
            loading={loading === 'vercel'}
          />
        )}
      </div>

      <div className="mt-6 border border-border/70 bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
        Chỉ phương thức đăng nhập đã được cấu hình thật mới xuất hiện trên trang này.
      </div>

      <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
        Code · Agents · Builds · Runtime · Review · Gate
      </p>
    </div>
  )
}
