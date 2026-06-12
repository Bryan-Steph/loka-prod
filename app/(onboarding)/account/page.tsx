'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Info, ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'

export default function AccountStepPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'en' | 'fr'>('en')
  const [agreed, setAgreed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<{ full_name: string; phone: string } | null>(null)

  useEffect(() => {
    fetch('/api/users/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setProfile(d.profile)
        if (d.profile?.language_pref) setLang(d.profile.language_pref)
      })
  }, [])

  const handleContinue = async () => {
    if (!agreed) return
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language_pref: lang }),
      })
      if (!res.ok) throw new Error('Failed to save preferences')
      router.push('/shop')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <OnboardingLayout
      step={1}
      backHref="/login"
      topTitle={
        <span className="font-heading text-[26px] font-extrabold text-primary">
          Loka
        </span>
      }
      footer={
        <button
          onClick={handleContinue}
          disabled={!agreed || saving}
          className={cn(
            'flex h-[52px] w-full items-center justify-center gap-2 rounded-xl font-heading text-[15px] font-semibold transition-colors',
            agreed && !saving
              ? 'bg-primary text-primary-foreground'
              : 'cursor-not-allowed bg-surface-3 text-muted-foreground',
          )}
        >
          {saving ? 'Saving...' : (
            <>Continue <ArrowRight size={18} /></>
          )}
        </button>
      }
    >
      <div className="px-4 pt-4">
        <h2 className="font-heading text-[22px] text-foreground">
          Confirm Your Account
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Your credentials are already set. Choose your language and agree to
          continue.
        </p>
      </div>

      <div className="m-4 space-y-4 rounded-2xl border border-surface-3 bg-surface-1 p-4">
        {/* Name — read only */}
        <div>
          <label className="mb-1.5 block text-[13px] text-foreground">Full Name</label>
          <div className="relative">
            <User
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              readOnly
              value={profile?.full_name ?? '—'}
              className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2/50 pl-10 pr-4 text-sm text-foreground opacity-70"
            />
          </div>
        </div>

        {/* Phone — read only */}
        <div>
          <label className="mb-1.5 block text-[13px] text-foreground">Phone</label>
          <div className="flex">
            <span className="flex h-12 w-[52px] items-center justify-center rounded-l-xl border border-r-0 border-surface-3 bg-surface-2/50 font-mono text-[13px] text-primary opacity-70">
              +237
            </span>
            <input
              readOnly
              value={profile?.phone?.replace('+237', '') ?? '—'}
              className="h-12 flex-1 rounded-r-xl border border-surface-3 bg-surface-2/50 px-3 font-mono text-[13px] text-foreground opacity-70"
            />
          </div>
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
                onClick={() => setLang(l)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-xs',
                  lang === l
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-surface-3 bg-surface-2 text-muted-foreground',
                )}
              >
                {l === 'en' ? 'English' : 'Français'}
              </button>
            ))}
          </div>
        </div>

        {/* Terms */}
        <button
          onClick={() => setAgreed((a) => !a)}
          className="flex items-start gap-2.5 text-left"
        >
          <span
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border',
              agreed
                ? 'border-primary bg-primary'
                : 'border-surface-3 bg-surface-2',
            )}
          >
            {agreed && <Check size={14} className="text-primary-foreground" />}
          </span>
          <span className="text-xs text-muted-foreground">
            I agree to Loka&apos;s{' '}
            <span className="font-semibold text-primary">Terms of Service</span>{' '}
            and{' '}
            <span className="font-semibold text-primary">Privacy Policy</span>
          </span>
        </button>

        {error && (
          <p className="text-xs text-error">{error}</p>
        )}
      </div>

      <div className="mx-4 flex gap-3 rounded-xl border-l-[3px] border-primary bg-surface-2 p-3.5">
        <Info size={16} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          You&apos;ll add your shop details, GPS location, and National ID in the
          next steps. Takes about 5 minutes total.
        </p>
      </div>
    </OnboardingLayout>
  )
}