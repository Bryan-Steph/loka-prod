'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Info,
  ArrowRight,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'

export default function AccountStepPage() {
  const [showPw, setShowPw] = useState(false)
  const [lang, setLang] = useState<'English' | 'Français'>('English')
  const [agreed, setAgreed] = useState(false)
  const [strength] = useState(3)

  return (
    <OnboardingLayout
      step={1}
      backHref="/sign-in"
      topTitle={
        <span className="font-heading text-[26px] font-extrabold text-primary">
          LOKA
        </span>
      }
      footer={
        <Link
          href="/shop"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary font-heading text-[15px] font-semibold text-primary-foreground"
        >
          Continue
          <ArrowRight size={18} />
        </Link>
      }
    >
      <div className="px-4 pt-4">
        <h2 className="font-heading text-[22px] text-foreground">
          Create Your Vendor Account
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          First, let&apos;s set up your account credentials
        </p>
      </div>

      <div className="m-4 space-y-4 rounded-2xl border border-surface-3 bg-surface-1 p-4">
        {/* Full Name */}
        <Field label="Full Name" icon={User} placeholder="Your full legal name" />

        {/* Email */}
        <div>
          <Field
            label="Email Address"
            icon={Mail}
            placeholder="your@email.com"
            type="email"
          />
          <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
            This will be your login email. Buyers won&apos;t see it.
          </p>
        </div>

        {/* Phone compound */}
        <div>
          <label className="mb-1.5 block text-[13px] text-foreground">
            Phone Number
          </label>
          <div className="flex">
            <span className="flex h-12 w-[52px] items-center justify-center rounded-l-xl border border-r-0 border-surface-3 bg-surface-2 font-mono text-[13px] text-primary">
              +237
            </span>
            <input
              placeholder="6XX XXX XXX"
              className="h-12 flex-1 rounded-r-xl border border-surface-3 bg-surface-2 px-3 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-[13px] text-foreground">
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full',
                  i < strength ? 'bg-primary' : 'bg-surface-3',
                )}
              />
            ))}
          </div>
        </div>

        {/* Confirm password */}
        <Field
          label="Confirm Password"
          icon={Lock}
          placeholder="Repeat your password"
          type="password"
        />

        {/* Language */}
        <div>
          <p className="mb-1.5 text-xs text-muted-foreground">
            Preferred language
          </p>
          <div className="flex gap-2">
            {(['English', 'Français'] as const).map((l) => (
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
                {l}
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
            {agreed ? (
              <Check size={14} className="text-primary-foreground" />
            ) : null}
          </span>
          <span className="text-xs text-muted-foreground">
            I agree to LOKA&apos;s{' '}
            <span className="font-semibold text-primary">Terms of Service</span>{' '}
            and{' '}
            <span className="font-semibold text-primary">Privacy Policy</span>
          </span>
        </button>
      </div>

      <div className="mx-4 flex gap-3 rounded-xl border-l-[3px] border-primary bg-surface-2 p-3.5">
        <Info size={16} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          You&apos;ll add your shop details, GPS location, and National ID in the
          next 7 steps. Takes about 5 minutes total.
        </p>
      </div>
    </OnboardingLayout>
  )
}

function Field({
  label,
  icon: Icon,
  placeholder,
  type = 'text',
}: {
  label: string
  icon: typeof User
  placeholder: string
  type?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] text-foreground">{label}</label>
      <div className="relative">
        <Icon
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type={type}
          placeholder={placeholder}
          className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  )
}
