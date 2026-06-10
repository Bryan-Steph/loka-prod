'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Tag, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'

interface Category { id: string; name_en: string; name_fr: string | null; icon_emoji: string | null; sort_order: number }


const EXPERIENCE = ['< 1 year', '1–3 years', '3–5 years', '5+ years']

export default function ShopStepPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [shopName, setShopName]         = useState('')
  const [categoryId, setCategoryId]     = useState<string | null>(null)
  const [desc, setDesc]                 = useState('')
  const [experience, setExperience]     = useState('1–3 years')
  const [opensAt, setOpensAt]           = useState('')
  const [closesAt, setClosesAt]         = useState('')
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')

  useEffect(() => {
    fetch('/api/products/categories')
      .then((r) => r.json())
      .then((d) => { if (d.categories) setCategories(d.categories) })
  }, [])

  const handleContinue = async () => {
    if (!shopName.trim()) { setError('Shop name is required'); return }
    setSaving(true); setError('')

    const operatingHours =
      opensAt || closesAt
        ? { opens: opensAt || null, closes: closesAt || null }
        : null

    try {
      const res = await fetch('/api/vendors/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_name:        shopName.trim(),
          shop_description: desc.trim() || null,
          category_id:      categoryId,
          operating_hours:  operatingHours,
          years_trading:    experience,
        }),
      })

      if (res.status === 409) {
        const patchRes = await fetch('/api/vendors/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shop_name:        shopName.trim(),
            shop_description: desc.trim() || null,
            category_id:      categoryId,
            operating_hours:  operatingHours,
            years_trading:    experience,
          }),
        })
        if (!patchRes.ok) throw new Error('Failed to update shop info')
        router.push('/location'); return
      }

      if (!res.ok) {
      let msg = `Request failed (${res.status})`
try {
  const d = await res.json()
  if (typeof d.error === 'string') msg = d.error
} catch { /* empty response body — 405/500 from Next.js */ }
throw new Error(msg)
      }
      router.push('/location')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <OnboardingLayout
      step={2}
      backHref="/account"
      topTitle="Set Up Your Shop"
      footer={
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/account')}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-surface-3 text-sm text-foreground"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={saving || !shopName.trim()}
            className={cn(
              'flex h-[52px] flex-1 items-center justify-center rounded-xl font-heading text-[15px] font-semibold transition-colors',
              shopName.trim() && !saving
                ? 'bg-primary text-primary-foreground'
                : 'cursor-not-allowed bg-surface-3 text-muted-foreground',
            )}
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
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
          <label className="mb-1.5 block text-[13px] text-foreground">Shop Name</label>
          <div className="relative">
            <Store size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              maxLength={60}
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Mama Agnes Electronics"
              className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
            Tip: Include your main product category in your name.
          </p>
        </div>

        {/* Category */}
        <div>
          <label className="mb-2 flex items-center gap-1.5 text-[13px] text-foreground">
            <Tag size={14} className="text-muted-foreground" />
            Primary Category
          </label>
          {categories.length === 0 ? (
            <p className="text-xs text-muted-foreground">Loading categories...</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs',
                    categoryId === c.id
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-surface-3 bg-surface-2 text-muted-foreground',
                  )}
                >
                  {c.name_en}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-[13px] text-foreground">Shop Description</label>
          <textarea
            value={desc}
            maxLength={200}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What do you sell? What makes your shop special?"
            className="h-[100px] w-full resize-none rounded-xl border border-surface-3 bg-surface-2 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
            {desc.length} / 200
          </p>
        </div>

        {/* Experience */}
        <div>
          <p className="mb-2 text-[13px] text-foreground">How long have you been trading?</p>
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
            <span className="font-mono text-[9px] text-muted-foreground">Optional</span>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Opens', value: opensAt, setter: setOpensAt, placeholder: '08:00' },
              { label: 'Closes', value: closesAt, setter: setClosesAt, placeholder: '18:00' },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label} className="flex-1">
                <p className="mb-1 text-xs text-muted-foreground">{label}</p>
                <div className="relative">
                  <Clock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="h-11 w-full rounded-xl border border-surface-3 bg-surface-2 pl-9 pr-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    </OnboardingLayout>
  )
}