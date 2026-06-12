'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, Home, ArrowLeft } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[App error]', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="font-syne text-[18px] font-bold text-foreground">Something went wrong</span>
      <p className="max-w-xs text-[13px] text-muted-foreground">
        An unexpected error occurred. You can try again, go back, or head home.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground"
        >
          <RefreshCw size={15} />
          Try again
        </button>
        <button
          onClick={() => router.back()}
          className="flex h-11 items-center gap-2 rounded-xl border border-surface-3 px-4 text-[13px] text-foreground"
        >
          <ArrowLeft size={15} />
          Go back
        </button>
        <Link href="/" className="flex h-11 items-center gap-2 rounded-xl border border-surface-3 px-4 text-[13px] text-foreground">
          <Home size={15} />
          Go home
        </Link>
      </div>
    </div>
  )
}