'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="font-syne text-[64px] font-extrabold text-primary">404</span>
      <h1 className="font-syne text-[18px] font-bold text-foreground">Page not found</h1>
      <p className="max-w-xs text-[13px] text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-11 items-center gap-2 rounded-xl border border-surface-3 px-4 text-[13px] text-foreground"
        >
          <ArrowLeft size={15} />
          Go back
        </button>
        <Link href="/" className="flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground">
          <Home size={15} />
          Go home
        </Link>
        <Link href="/search" className="flex h-11 items-center gap-2 rounded-xl border border-surface-3 px-4 text-[13px] text-foreground">
          <Search size={15} />
          Search
        </Link>
      </div>
    </div>
  )
}