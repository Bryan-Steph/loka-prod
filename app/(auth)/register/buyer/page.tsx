'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

function getStrength(pw: string): number {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export default function BuyerRegisterPage() {
  const router = useRouter()
  const { register, login } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [lang, setLang] = useState<'en' | 'fr'>('en')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const strength = getStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service to continue.')
      return
    }

    const fullPhone = '+237' + phone.replace(/\s/g, '')
    setLoading(true)

    try {
      await register({
        full_name: fullName,
        email,
        phone: fullPhone,
        password,
        role: 'buyer',
        language_pref: lang,
      })
      // Auto-login after successful registration
      await login(email, password)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back button — fixed top-left */}
<button
  type="button"
  onClick={() => router.push('/')}
  className="fixed left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted-foreground"
  aria-label="Go home"
>
  <ArrowLeft size={18} />
</button>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/register">
          <ArrowLeft size={24} className="text-foreground" />
        </Link>
        <span className="font-heading text-[22px] font-extrabold text-primary">
          Loka
        </span>
        <div className="w-6" />
      </div>

      <div className="px-4 pb-10">
        <h1 className="mt-2 font-heading text-[22px] text-foreground">
          Create Buyer Account
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          It&apos;s free. Always.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mt-4 space-y-4 rounded-2xl border border-surface-3 bg-surface-1 p-4">
            {/* Full name */}
            <div className="relative">
              <User
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

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

            {/* Phone */}
            <div className="flex">
              <span className="flex h-12 w-[52px] items-center justify-center rounded-l-xl border border-r-0 border-surface-3 bg-surface-2 font-mono text-[13px] text-primary">
                +237
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="6XX XXX XXX"
                required
                className="h-12 flex-1 rounded-r-xl border border-surface-3 bg-surface-2 px-3 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
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
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
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
              {/* Strength bar */}
              <div className="mt-2 flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      i < strength ? 'bg-primary' : 'bg-surface-3'
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
                className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Language */}
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">
                Preferred language
              </p>
              <div className="flex gap-2">
                {(['en', 'fr'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={cn(
                      'rounded-full border px-4 py-1.5 text-xs',
                      lang === l
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-surface-3 bg-surface-2 text-muted-foreground'
                    )}
                  >
                    {l === 'en' ? 'English' : 'Français'}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <button
              type="button"
              onClick={() => setAgreed((a) => !a)}
              className="flex items-start gap-2.5 text-left"
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                  agreed
                    ? 'border-primary bg-primary'
                    : 'border-surface-3 bg-surface-2'
                )}
              >
                {agreed && (
                  <Check size={14} className="text-primary-foreground" />
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                I agree to Loka&apos;s{' '}
                <span className="font-semibold text-primary">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="font-semibold text-primary">
                  Privacy Policy
                </span>
              </span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-3 py-2.5">
              <AlertCircle size={16} className="shrink-0 text-error" />
              <span className="text-[13px] text-error">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-heading text-[15px] font-semibold text-primary-foreground disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[13px] text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}