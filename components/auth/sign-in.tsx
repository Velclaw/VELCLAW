'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function SignIn() {
  return (
    <Button asChild variant="outline" size="sm" className="border-border bg-card/60 hover:border-violet-400/70 hover:bg-violet-500/5">
      <Link href="/auth/signin">Sign in</Link>
    </Button>
  )
}
