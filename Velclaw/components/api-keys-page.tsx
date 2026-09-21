'use client'

import { useState } from 'react'
import Link from 'next/link'
import { KeyRound, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiKeysDialog } from '@/components/api-keys-dialog'

export function ApiKeysPage() {
  const [open, setOpen] = useState(false)

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-violet-400/60 bg-violet-500/10">
              <KeyRound className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">VELCLAW / API</p>
              <h1 className="text-2xl font-semibold">API Keys</h1>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Quản lý key của các agent/provider. Velclaw chỉ hiển thị trạng thái đã lưu; giá trị key không được đưa vào
            URL, log hoặc giao diện sau khi lưu.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Provider keys</CardTitle>
              <CardDescription>OpenAI, Anthropic, Gemini, Cursor và AI Gateway.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setOpen(true)} className="w-full">
                Quản lý API Keys
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-violet-300" />
                Security
              </CardTitle>
              <CardDescription>Key được mã hóa ở lớp lưu trữ hiện có của Velclaw.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs leading-5 text-muted-foreground">
              Không commit API key vào repository. Không dán key vào task prompt. Khi đổi key, hãy xóa key cũ sau khi
              xác nhận key mới hoạt động.
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 text-xs">
          <Button variant="outline" asChild>
            <Link href="/mcp">MCP Servers</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/wiki">Wiki</Link>
          </Button>
        </div>

        <ApiKeysDialog open={open} onOpenChange={setOpen} />
      </div>
    </main>
  )
}
