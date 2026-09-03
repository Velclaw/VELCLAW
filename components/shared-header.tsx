'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useTasks } from '@/components/app-layout'
import { User } from '@/components/auth/user'

interface SharedHeaderProps {
  leftActions?: React.ReactNode
  extraActions?: React.ReactNode
  initialStars?: number
  hideStars?: boolean
  hideDeployButton?: boolean
}

export function SharedHeader({ leftActions, extraActions }: SharedHeaderProps) {
  const { toggleSidebar } = useTasks()

  return (
    <div className="px-0 pt-0.5 md:pt-3 pb-1.5 md:pb-4 overflow-visible">
      <div className="relative flex items-center justify-between gap-2 h-8 min-w-0">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
          {leftActions}
        </div>

        <Link
          href="/"
          aria-label="Velclaw home"
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex items-center"
        >
          <img src="/brand/velclaw-logo.svg?v=3" alt="VELCLAW" className="h-8 w-auto max-w-[150px]" />
        </Link>
        <Link
          href="/"
          aria-label="Velclaw home"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 md:hidden"
        >
          <img src="/brand/velclaw-logo.svg?v=3" alt="VELCLAW" className="h-8 w-auto max-w-[112px]" />
        </Link>

        <div className="flex items-center gap-2 flex-shrink-0">
          {extraActions}
          <User />
        </div>
      </div>
    </div>
  )
}
