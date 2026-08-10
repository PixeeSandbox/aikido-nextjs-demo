import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata, Viewport } from 'next'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { SessionProvider } from '@/components/SessionProvider'
import { ToastRegion } from '@/components/Toast'
import { publicEnv } from '@/lib/env'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Cedarwood Observatory & Science Park',
    template: '%s · Cedarwood Observatory',
  },
  description:
    'Timed-entry admissions, planetarium shows, and seasonal exhibits at the Cedarwood Observatory & Science Park.',
  metadataBase: new URL('https://cedarwoodobservatory.org'),
  openGraph: {
    type: 'website',
    siteName: 'Cedarwood Observatory',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#11152b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = publicEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="en" className="bg-night-900 text-night-50">
      <body className="font-body antialiased">
        <SessionProvider>
          <Header />
          <main className="mx-auto w-full max-w-content px-4 py-10">{children}</main>
          <Footer />
          <ToastRegion />
        </SessionProvider>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  )
}
