import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Suspense } from 'react'
import { RouteProgressBar } from '@/components/ui/RouteProgessBar'

/**
 * Temporary no-op LanguageProvider to satisfy usage in RootLayout.
 * Replace this with the real provider implementation or import it from its module.
 */
function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export const metadata: Metadata = {
  title: 'LOKA — Find it. Bargain it. Get it.',
  description: "Bamenda's digital market. Verified vendors, safe bargaining, real pickup.",
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#F59E0B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
   <body>
  <Suspense fallback={null}><RouteProgressBar /></Suspense>
  <LanguageProvider>
    {children}
  </LanguageProvider>
</body>
    </html>
  )
}