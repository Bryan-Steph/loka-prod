import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans, DM_Mono } from 'next/font/google'
// Note: Double check the spelling of this file path in your actual folder!
import { Suspense } from 'react'
import { RouteProgressBar } from '@/components/ui/RouteProgessBar'

import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Loka — Find it. Bargain it. Get it.',
  description: "Bamenda's digital market. Verified vendors, safe bargaining, real pickup.",
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#F59E0B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body>
        {/* We actually render the progress bar component here! */}
         <Suspense fallback={null}>
          <RouteProgressBar />
        </Suspense>        {children}
      </body>
    </html>
  )
}