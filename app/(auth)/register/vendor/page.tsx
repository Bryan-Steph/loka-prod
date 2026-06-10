'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Info,
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

export default function VendorRegisterPage() {
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
        role: 'vendor',
        language_pref: lang,
      })
      // Auto-login then continue to shop setup (onboarding step 2)
      await login(email, password)
      router.push('/shop')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/register">
          <ArrowLeft size={24} className="text-foreground" />
        </Link>
        <span className="font-heading text-[22px] font-extrabold text-primary">
          Shopsy
        </span>
        <div className="w-6" />
      </div>

      {/* Step indicator */}
      <div className="px-4">
        <div className="mb-1 flex justify-end">
          <span className="font-mono text-[11px] text-primary">
            Step 1 of 8
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full',
                i === 0 ? 'bg-primary' : 'bg-surface-3'
              )}
            />
          ))}
        </div>
      </div>

      <div className="px-4 pb-10">
        <h1 className="mt-4 font-heading text-[22px] text-foreground">
          Start Selling on Shopsy
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          First, let&apos;s set up your account
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
                placeholder="Your full legal name"
                required
                className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Email */}
            <div>
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
              <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                Your login email. Buyers won&apos;t see it.
              </p>
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
                I agree to Shopsy&apos;s{' '}
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

          {/* Info banner */}
          <div className="mt-3 flex gap-3 rounded-xl border-l-[3px] border-primary bg-surface-2 p-3.5">
            <Info size={16} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              You&apos;ll add your shop details, GPS location, and National ID
              in the next 7 steps. Takes about 5 minutes total.
            </p>
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
              <>
                Continue <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}