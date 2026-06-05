'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { LOKAWordmark } from '@/components/ui/loka-wordmark'
import { Field } from '@/components/ui/field'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showError, setShowError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setShowError(false)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setShowError(true)
    }, 1400)
  }

  return (
    <main className="flex min-h-screen flex-col justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-sm">
        {/* Section 1 — Wordmark */}
        <LOKAWordmark size={36} tagline className="mb-8" />

        {/* Section 2 — Login Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-surface-3 bg-surface-1 p-6"
        >
          <h1 className="font-syne text-[22px] font-bold text-foreground">
            Welcome back
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Sign in to continue
          </p>

          {showError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-error/40 bg-error/10 px-3 py-2.5">
              <AlertCircle size={16} className="shrink-0 text-error" />
              <span className="text-[13px] text-error">
                Invalid email or password
              </span>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <Field
              icon={Mail}
              type="email"
              inputMode="email"
              placeholder="your@email.com"
              value={email}
              onChange={setEmail}
            />
            <Field
              icon={Lock}
              password
              placeholder="Password"
              value={password}
              onChange={setPassword}
            />
            <div className="flex justify-end">
              <button
                type="button"
                className="text-[12px] text-primary transition-colors hover:text-primary-light"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-primary font-syne text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-80"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-surface-3" />
            <span className="text-[12px] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-surface-3" />
          </div>

          <Link
            href="/register"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-surface-3 text-[14px] font-medium text-foreground transition-colors hover:border-primary/50"
          >
            Create an account
          </Link>
        </form>

        {/* Section 3 — Footer */}
        <p className="mt-8 text-center font-mono text-[10px] text-muted-foreground">
          v1.0.0 · loka.cm
        </p>
      </div>
    </main>
  )
}
