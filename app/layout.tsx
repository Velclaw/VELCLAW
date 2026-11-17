import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AppLayoutWrapper } from '@/components/app-layout-wrapper'
import { SessionProvider } from '@/components/auth/session-provider'
import { JotaiProvider } from '@/components/providers/jotai-provider'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import {
  getVelclawDomainRole,
  getVelclawDomainConfig,
  getVelclawDomainRoleContent,
  getVelclawOriginForRole,
} from '@/lib/velclaw/domain-config'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

/** Generates metadata for the Velclaw domain role identified by the request's Host header. */
export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers()
  const role = getVelclawDomainRole(requestHeaders.get('host'))
  const content = getVelclawDomainRoleContent[role]
  const origin = getVelclawOriginForRole(role)

  return {
    metadataBase: new URL(origin),
    title: {
      default: content.title,
      template: '%s | Velclaw',
    },
    description: content.description,
    applicationName: 'Velclaw',
    alternates: { canonical: origin },
    openGraph: {
      type: 'website',
      siteName: 'Velclaw',
      url: origin,
      title: content.title,
      description: content.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
    },
    robots: { index: true, follow: true },
  }
}

/** Wraps every page in shared providers and emits structured data for the request's domain role. */
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers()
  const role = getVelclawDomainRole(requestHeaders.get('host'))
  const content = getVelclawDomainRoleContent[role]
  const config = getVelclawDomainConfig()

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': role === 'application' ? 'SoftwareApplication' : 'Organization',
              name: content.name,
              url: getVelclawOriginForRole(role),
              description: content.description,
              logo: `${config.publicOrigin}/velclaw-mark.svg`,
              sameAs: Object.values(config.roles),
              ...(role === 'application'
                ? { applicationCategory: 'DeveloperApplication', operatingSystem: 'Web' }
                : {}),
            }),
          }}
        />
      </body>
    </html>
  )
}
