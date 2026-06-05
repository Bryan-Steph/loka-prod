'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { LOKAWordmark } from '@/components/ui/loka-wordmark'
import { RegistrationFields } from '@/components/auth/registration-fields'

export default function BuyerRegisterPage() {
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
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

      <div className="mx-auto mt-4 w-full max-w-sm">
        <h1 className="font-syne text-[22px] font-bold text-foreground">
          Create Buyer Account
        </h1>
        <p className="mb-5 mt-1 text-[13px] text-muted-foreground">
          It&apos;s free. Always.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-surface-3 bg-surface-1 p-5">
            <RegistrationFields />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-primary font-syne text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-80"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
