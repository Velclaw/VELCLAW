import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AppLayoutWrapper } from '@/components/app-layout-wrapper'
import { SessionProvider } from '@/components/auth/session-provider'
import { JotaiProvider } from '@/components/providers/jotai-provider'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { VELCLAW_PUBLIC_ORIGIN } from '@/lib/velclaw/domain-config'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(VELCLAW_PUBLIC_ORIGIN),
  title: {
    default: 'Velclaw — AI-native Software Workspace',
    template: '%s | Velclaw',
  },
  description: 'Velclaw is an AI-native software workspace for agents, code, builds, runtime, review and delivery.',
  applicationName: 'Velclaw',
  alternates: {
    languages: {
      vi: VELCLAW_PUBLIC_ORIGIN,
      en: VELCLAW_PUBLIC_ORIGIN,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Velclaw',
    url: VELCLAW_PUBLIC_ORIGIN,
    title: 'Velclaw — AI-native Software Workspace',
    description: 'AI-native workspace for agents, code, builds, runtime, review and delivery.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <JotaiProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <SessionProvider />
            <AppLayoutWrapper>{children}</AppLayoutWrapper>
            <Toaster />
          </ThemeProvider>
        </JotaiProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
