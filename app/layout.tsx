import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AppLayoutWrapper } from '@/components/app-layout-wrapper'
import { SessionProvider } from '@/components/auth/session-provider'
import { JotaiProvider } from '@/components/providers/jotai-provider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://velclaw.cfd'),
  title: {
    default: 'Velclaw — AI-native Software Workspace',
    template: '%s | Velclaw',
  },
  description: 'Velclaw is an AI-native software workspace for agents, code, builds, runtime, review and delivery.',
  applicationName: 'Velclaw',
  alternates: {
    languages: {
      vi: 'https://velclaw.cfd',
      en: 'https://velclaw.cfd',
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Velclaw',
    url: 'https://velclaw.cfd',
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
