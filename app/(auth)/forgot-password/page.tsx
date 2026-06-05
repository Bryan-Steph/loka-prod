'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  KeyRound,
  Mail,
  Loader2,
  MailCheck,
  Info,
} from 'lucide-react'

export default function ForgotPasswordPage() {
  const [state, setState] = useState<'form' | 'success'>('form')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setState('success')
      setCooldown(60)
    }, 1200)
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <Link
        href="/sign-in"
        aria-label="Go back"
        className="absolute left-5 top-5 text-muted-foreground"
      >
        <ArrowLeft size={24} />
      </Link>

      <div className="w-full max-w-[380px]">
        <p className="mb-8 text-center font-heading text-[32px] font-extrabold text-primary">
          LOKA
        </p>

        {state === 'form' ? (
          <div className="rounded-2xl border border-surface-3 bg-surface-1 p-6">
            <div className="mb-4 flex justify-center">
              <KeyRound size={40} className="text-primary" />
            </div>
            <h1 className="text-center font-heading text-[22px] text-foreground">
              Forgot Password?
            </h1>
            <p className="mb-6 mt-1 text-center text-[13px] leading-relaxed text-muted-foreground">
              Enter your email and we&apos;ll send you a secure reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-heading text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <Link
              href="/sign-in"
              className="mt-4 flex items-center justify-center gap-1 text-[13px] text-primary"
            >
              <ArrowLeft size={12} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <div className="animate-loka-fade-up rounded-2xl border border-surface-3 bg-surface-1 p-6">
            <div className="mb-4 flex justify-center">
              <MailCheck
                size={48}
                className="animate-loka-pulse text-success"
              />
            </div>
            <h1 className="text-center font-heading text-[22px] text-foreground">
              Check Your Email
            </h1>
            <p className="mt-1 text-center text-[13px] leading-relaxed text-muted-foreground">
              We&apos;ve sent a password reset link to{' '}
              <span className="font-semibold text-foreground">
                {email || 'your@email.com'}
              </span>
              . The link expires in 15 minutes.
            </p>

            <div className="mt-4 rounded-xl bg-surface-2 p-3.5">
              <div className="flex gap-2">
                <Info size={14} className="mt-0.5 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Didn&apos;t receive it? Check your spam folder or wait 1–2
                  minutes before requesting again.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={cooldown > 0}
              onClick={() => setCooldown(60)}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-xl border border-surface-3 font-medium text-primary disabled:text-muted-foreground"
            >
              {cooldown > 0 ? (
                <span className="font-mono text-sm">{`Resend in ${cooldown}s`}</span>
              ) : (
                'Resend Email'
              )}
            </button>

            <Link
              href="/sign-in"
              className="mt-4 flex items-center justify-center gap-1 text-[13px] text-primary"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
