'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Info, Loader2 } from 'lucide-react'
import { LOKAWordmark } from '@/components/ui/loka-wordmark'
import { RegistrationFields } from '@/components/auth/registration-fields'
import { StepProgress } from '@/components/auth/step-progress'

export default function VendorRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => router.push('/onboarding'), 1200)
  }

  return (
    <main className="min-h-screen px-4 pb-12">
      <header className="flex h-14 items-center justify-between">
        <Link
          href="/register"
          className="flex h-10 w-10 items-center justify-center text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </Link>
        <LOKAWordmark size={22} />
        <span className="h-8 w-8" aria-hidden="true" />
      </header>

      <div className="mx-auto mt-2 w-full max-w-sm">
        <p className="mb-2 text-center font-mono text-[11px] text-primary">
          Step 1 of 8
        </p>
        <StepProgress step={1} />

        <h1 className="mt-6 font-syne text-[22px] font-bold text-foreground">
          Start Selling on LOKA
        </h1>
        <p className="mb-5 mt-1 text-[13px] text-muted-foreground">
          First, let&apos;s set up your account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-surface-3 bg-surface-1 p-5">
            <RegistrationFields />
          </div>

          <div className="mt-4 flex gap-2.5 rounded-xl border-l-[3px] border-primary bg-surface-2 p-3">
            <Info size={16} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-[12px] text-muted-foreground">
              You&apos;ll add your shop details and upload your National ID in the
              next steps.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-syne text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-80"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
