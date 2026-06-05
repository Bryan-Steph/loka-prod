'use client'
// shop/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { Store, Tag, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Food & Drinks',
  'Fresh Produce',
  'Household',
  'Beauty',
  'Phones & Accessories',
  'Books',
]

const EXPERIENCE = ['< 1 year', '1–3 years', '3–5 years', '5+ years']

export default function ShopStepPage() {
  const [category, setCategory] = useState('Electronics')
  const [experience, setExperience] = useState('1–3 years')
  const [desc, setDesc] = useState('')

  return (
    <OnboardingLayout
      step={2}
      backHref="/account"
      topTitle="Set Up Your Shop"
      footer={
        <div className="flex gap-3">
          <Link
            href="/account"
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-surface-3 text-sm text-foreground"
          >
            Back
          </Link>
          <Link
            href="/location"
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl bg-primary font-heading text-[15px] font-semibold text-primary-foreground"
          >
            Continue
          </Link>
        </div>
      }
    >
      <div className="px-4 pt-4">
        <h2 className="font-heading text-[22px] text-foreground">
          Tell us about your shop
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          This is what buyers will see on your public vendor profile.
        </p>
      </div>

      <div className="m-4 space-y-5 rounded-2xl border border-surface-3 bg-surface-1 p-4">
        {/* Shop name */}
        <div>
          <label className="mb-1.5 block text-[13px] text-foreground">
            Shop Name
          </label>
          <div className="relative">
            <Store
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              maxLength={60}
              placeholder="e.g. Mama Agnes Electronics"
              className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
            Tip: Include your main product category in your name.
          </p>
        </div>

        {/* Primary category */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-[13px] text-foreground">
            <Tag size={14} className="text-muted-foreground" />
            Primary Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs',
                  category === c
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-surface-3 bg-surface-2 text-muted-foreground',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-[13px] text-foreground">
            Shop Description
          </label>
          <textarea
            value={desc}
            maxLength={200}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What do you sell? What makes your shop special? e.g. Quality secondhand phones and accessories, open 8am–7pm daily"
            className="h-[100px] w-full resize-none rounded-xl border border-surface-3 bg-surface-2 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
            {desc.length} / 200
          </p>
        </div>

        {/* Years in business */}
        <div>
          <p className="mb-2 text-[13px] text-foreground">
            How long have you been trading?
          </p>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE.map((e) => (
              <button
                key={e}
                onClick={() => setExperience(e)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs',
                  experience === e
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-surface-3 bg-surface-2 text-muted-foreground',
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Operating hours */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] text-foreground">Operating Hours</p>
            <span className="font-mono text-[9px] text-muted-foreground">
              Optional
            </span>
          </div>
          <div className="flex gap-3">
            {['Opens', 'Closes'].map((l, i) => (
              <div key={l} className="flex-1">
                <p className="mb-1 text-xs text-muted-foreground">{l}</p>
                <div className="relative">
                  <Clock
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    placeholder={i === 0 ? '08:00' : '18:00'}
                    className="h-11 w-full rounded-xl border border-surface-3 bg-surface-2 pl-9 pr-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
