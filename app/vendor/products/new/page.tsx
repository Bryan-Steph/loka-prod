'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  HelpCircle,
  Info,
  Tag,
  Grid,
  AlignLeft,
  Package,
  MessageSquare,
  ArrowDown,
  Sparkles,
  Lock,
  Plus,
  Camera,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const CONDITIONS = ['New', 'Used', 'Refurbished']

export default function AddProductPage() {
  const [name, setName] = useState('')
  const [condition, setCondition] = useState('New')
  const [description, setDescription] = useState('')
  const [inStock, setInStock] = useState(true)
  const [price, setPrice] = useState('')
  const [bargain, setBargain] = useState(false)
  const [minPrice, setMinPrice] = useState('')

  return (
    <main className="min-h-screen pb-28">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <Link
          href="/vendor/dashboard"
          className="flex h-10 w-9 items-center justify-center text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-syne text-[16px] font-bold text-foreground">Add Product</h1>
        <button
          className="flex h-10 w-9 items-center justify-center text-muted-foreground"
          aria-label="Help"
        >
          <HelpCircle size={20} />
        </button>
      </header>

      <div className="mx-auto w-full max-w-[640px] space-y-4 px-4 pt-4">
        {/* Hint banner */}
        <div className="flex items-center gap-2.5 rounded-xl border border-surface-3 bg-surface-2 p-3">
          <Info size={16} className="shrink-0 text-primary" />
          <p className="text-[12px] text-muted-foreground">
            Complete all sections for maximum visibility in search results
          </p>
        </div>

        {/* Section 1 — Photos */}
        <section className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <h2 className="font-syne text-[14px] font-bold text-foreground">
            Product Photos
          </h2>
          <div className="mt-3 flex gap-2">
            <button className="flex h-[72px] w-[72px] flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-primary bg-surface-2">
              <div className="flex items-center gap-0.5 text-primary">
                <Plus size={14} />
                <Camera size={14} />
              </div>
              <span className="font-mono text-[9px] text-primary">Add</span>
            </button>
            {[2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex h-[72px] w-[72px] items-center justify-center rounded-xl border border-dashed border-surface-3 bg-surface-2"
              >
                <Plus size={18} className="text-muted-foreground" />
              </div>
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            First photo is your cover image · Up to 5 photos
          </p>
        </section>

        {/* Section 2 — Product info */}
        <section className="space-y-3 rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <h2 className="font-syne text-[14px] font-bold text-foreground">
            Product Details
          </h2>

          <div className="flex h-12 items-center gap-2.5 rounded-xl border border-surface-3 bg-surface-2 px-3 focus-within:border-primary">
            <Tag size={16} className="shrink-0 text-muted-foreground" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samsung Galaxy A32 (Unlocked)"
              className="h-full w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <span className="text-primary">*</span>
          </div>

          <button className="flex h-12 w-full items-center gap-2.5 rounded-xl border border-surface-3 bg-surface-2 px-3 text-left">
            <Grid size={16} className="shrink-0 text-muted-foreground" />
            <span className="flex-1 text-[14px] text-foreground">Electronics</span>
            <ArrowDown size={16} className="text-muted-foreground" />
          </button>

          <div>
            <p className="mb-1.5 text-[12px] text-muted-foreground">Condition</p>
            <div className="flex gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  className={cn(
                    'flex-1 rounded-xl py-2.5 text-[13px] font-medium transition-colors',
                    condition === c
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-2 text-muted-foreground',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex gap-2.5 rounded-xl border border-surface-3 bg-surface-2 p-3 focus-within:border-primary">
              <AlignLeft size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
              <textarea
                rows={3}
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product. Buyers trust detailed listings."
                className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
              {description.length} / 500
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Package size={16} className="text-muted-foreground" />
            <span className="flex-1 text-[13px] text-foreground">In Stock</span>
            <Toggle on={inStock} onClick={() => setInStock((s) => !s)} />
          </div>
        </section>

        {/* Section 3 — Pricing */}
        <section className="space-y-3 rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <h2 className="font-syne text-[14px] font-bold text-foreground">Pricing</h2>

          <div>
            <div className="flex h-12 items-center gap-2.5 rounded-xl border border-surface-3 bg-surface-2 px-3 focus-within:border-primary">
              <span className="font-mono text-[13px] text-primary">XAF</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="numeric"
                placeholder="0"
                className="h-full w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
              e.g. 45,000 XAF
            </p>
          </div>

          <div className="rounded-xl bg-surface-2 p-3.5">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={16} className="text-primary" />
              <span className="flex-1 text-[14px] text-foreground">
                Allow Bargaining
              </span>
              <Toggle on={bargain} onClick={() => setBargain((b) => !b)} />
            </div>
            {bargain && (
              <div className="mt-3 space-y-2 border-t border-surface-3 pt-3">
                <div className="flex items-center gap-2">
                  <ArrowDown size={14} className="shrink-0 text-muted-foreground" />
                  <span className="text-[12px] text-muted-foreground">
                    Minimum acceptable price:
                  </span>
                  <div className="flex h-9 flex-1 items-center gap-1.5 rounded-lg border border-surface-3 bg-surface-1 px-2">
                    <input
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      inputMode="numeric"
                      placeholder="0"
                      className="h-full w-full bg-transparent font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <span className="font-mono text-[11px] text-primary">XAF</span>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Offers below this amount are automatically declined
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Section 4 — Phase 2 locked */}
        <section className="relative overflow-hidden rounded-xl bg-surface-2 p-3.5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span className="font-syne text-[14px] font-bold text-foreground">
              AI Description Generator
            </span>
            <span className="rounded-full bg-[#8b5cf6]/15 px-2 py-0.5 font-mono text-[9px] text-[#a78bfa]">
              Phase 2
            </span>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Upload a photo and AI will write your product title and description in
            English and French.
          </p>
          <div className="absolute inset-0 flex items-center justify-center bg-surface-2/60">
            <Lock size={24} className="text-muted-foreground" />
          </div>
        </section>
      </div>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[1200px] border-t border-surface-3 bg-surface-1 p-4">
        <Link
          href="/vendor/dashboard?published=1"
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary font-syne text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          <Upload size={18} />
          Publish Product
        </Link>
      </div>
    </main>
  )
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        on ? 'bg-primary' : 'bg-surface-3',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
          on ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}
