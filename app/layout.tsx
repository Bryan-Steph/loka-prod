import type { Metadata, Viewport } from 'next'
import './globals.css'
import { RouteProgressBar } from '@/components/ui/RouteProgessBar'
import { Suspense }          from 'react'
import { LanguageProvider }  from '@/lib/i18n/LanguageProvider'
import { PWAInstallPrompt }  from '@/components/ui/PWAInstallPrompt'
import { PushPermissionBanner } from '@/components/ui/PushPermissionBanner'
import Script from 'next/script'


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
        <link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#F59E0B" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="LOKA" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
 <Script id="sw-register" strategy="afterInteractive">{`
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').catch(console.error)
    })
  }
`}</Script>
   <body>
   <Suspense fallback={null}><RouteProgressBar /></Suspense>
  <LanguageProvider>
    {children}
    {/* These mount once, show only on mobile, respect dismiss state */}
    <PWAInstallPrompt />
    <PushPermissionBanner />
  </LanguageProvider>
</body>
    </html>
  )
}