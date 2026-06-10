'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  KeyRound,
  Mail,
  MailCheck,
  Info,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      }
    )

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSent(true)
    startCooldown()
  }

  const startCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    startCooldown()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Back button */}
      <div className="absolute left-4 top-4">
        <Link href="/login">
          <ArrowLeft size={24} className="text-foreground" />
        </Link>
      </div>

      {/* Wordmark */}
      <span className="mb-8 font-heading text-[32px] font-extrabold text-primary">
        Shopsy
      </span>

      <div className="w-full max-w-[380px] rounded-2xl border border-surface-3 bg-surface-1 p-6">
        {!sent ? (
          <>
            {/* Form state */}
            <div className="mb-6 flex flex-col items-center">
              <KeyRound size={40} className="mb-4 text-primary" />
              <h1 className="font-heading text-[22px] text-foreground">
                Forgot Password?
              </h1>
              <p className="mt-1 text-center text-[13px] text-muted-foreground">
                Enter your email and we&apos;ll send you a secure reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-3 py-2.5">
                  <AlertCircle size={16} className="shrink-0 text-error" />
                  <span className="text-[13px] text-error">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-heading text-[15px] font-semibold text-primary-foreground disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <Link
              href="/login"
              className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-primary"
            >
              <ArrowLeft size={12} />
              Back to Sign In
            </Link>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="mb-6 flex flex-col items-center">
              <MailCheck
                size={48}
                className="mb-4 animate-pulse-ring text-success"
              />
              <h1 className="font-heading text-[22px] text-foreground">
                Check Your Email
              </h1>
              <p className="mt-2 text-center text-[13px] text-muted-foreground">
                We&apos;ve sent a password reset link to{' '}
                <span className="font-semibold text-foreground">{email}</span>.
                The link expires in 15 minutes.
              </p>
            </div>

            <div className="mb-4 flex items-start gap-2 rounded-xl bg-surface-2 p-3.5">
              <Info size={14} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[12px] text-muted-foreground">
                Didn&apos;t receive it? Check your spam folder or wait 1–2
                minutes before requesting again.
              </p>
            </div>

            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-surface-3 font-mono text-[13px] text-primary disabled:text-muted-foreground"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
            </button>

            <Link
              href="/login"
              className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-primary"
            >
              <ArrowLeft size={12} />
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </div>
  )
}