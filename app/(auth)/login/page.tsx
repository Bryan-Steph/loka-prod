'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await login(email, password)
      const next = searchParams.get('next')
      if (next) {
        router.push(next)
      } else if (user.role === 'vendor') {
        router.push('/vendor/dashboard')
      } else {
        router.push('/')
      }
         router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      {/* Back button — fixed top-left */}
      <button
     type="button"
  onClick={() => router.push('/')}
  className="fixed left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted-foreground"
  aria-label="Go home"
      >
  <ArrowLeft size={18} />
      </button>
      {/* Wordmark */}
      <div className="mb-8 text-center">
        <span className="font-heading text-[36px] font-extrabold text-primary">
          Loka
        </span>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Find it. Bargain it. Get it.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[380px] rounded-2xl border border-surface-3 bg-surface-1 p-6">
        <h1 className="font-heading text-[22px] text-foreground">
          Welcome back
        </h1>
        <p className="mb-6 mt-1 text-[13px] text-muted-foreground">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
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
              autoComplete="email"
              className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                autoComplete="current-password"
                className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="mt-1.5 text-right">
              <Link
                href="/forgot-password"
                className="text-[12px] text-primary"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-3 py-2.5">
              <AlertCircle size={16} className="shrink-0 text-error" />
              <span className="text-[13px] text-error">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-heading text-[15px] font-semibold text-primary-foreground disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-3" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface-1 px-3 text-[12px] text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Register link */}
          <Link
            href="/register"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-surface-3 text-[14px] text-foreground"
          >
            Create an account
          </Link>
        </form>
      </div>

      <p className="mt-6 font-mono text-[10px] text-muted-foreground">
        v1.0.0 · Loka.cm
      </p>
    </div>
  )
}

// useSearchParams requires Suspense boundary
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}