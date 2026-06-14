'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, HelpCircle, Info, Tag, AlignLeft,
  Package, MessageSquare, ArrowDown, Sparkles, Lock,
  Plus, Camera, Upload, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImageUpload } from '@/components/ui/ImageUpload'

const CONDITIONS = [
  { label: 'New',         value: 'new' },
  { label: 'Used',        value: 'used' },
  { label: 'Refurbished', value: 'refurbished' },
] as const
type Condition = typeof CONDITIONS[number]['value']

interface Category { id: string; name_en: string; name_fr: string | null }

function cloudinaryThumb(url: string) {
  return url
}

export default function AddProductPage() {
  const router = useRouter()

  const [photoUrls, setPhotoUrls]      = useState<(string | null)[]>([null, null, null, null, null])
  const [name, setName]                = useState('')
  const [categoryId, setCategoryId]    = useState<string | null>(null)
  const [condition, setCondition]      = useState<Condition>('new')
  const [description, setDescription] = useState('')
  const [inStock, setInStock]          = useState(true)
  const [price, setPrice]              = useState('')
  const [bargain, setBargain]          = useState(false)
  const [categories, setCategories]    = useState<Category[]>([])
  const [catOpen, setCatOpen]          = useState(false)
  const [submitting, setSubmitting]    = useState(false)
  const [error, setError]              = useState('')

  useEffect(() => {
    fetch('/api/products/categories')
      .then((r) => r.json())
      .then((d) => { if (d.categories) setCategories(d.categories) })
  }, [])

  const selectedCat  = categories.find((c) => c.id === categoryId)
  const filledPhotos = photoUrls.filter(Boolean) as string[]
  const priceInt     = parseInt(price.replace(/\D/g, ''), 10)

  const canSubmit =
    !submitting &&
    filledPhotos.length >= 1 &&
    name.trim().length >= 2 &&
    !isNaN(priceInt) && priceInt > 0

  const setPhotoAt = (index: number, url: string) =>
    setPhotoUrls((prev) => { const n = [...prev]; n[index] = url; return n })
  const clearPhotoAt = (index: number) =>
    setPhotoUrls((prev) => { const n = [...prev]; n[index] = null; return n })

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name_en:            name.trim(),
          description_en:     description.trim() || null,
          price:              priceInt,
          condition,
          category_id:        categoryId,
          photo_urls:         filledPhotos,
          bargaining_allowed: bargain,
          stock_status:       inStock ? 'in_stock' : 'out_of_stock',
        }),
      })

      const d = await res.json()

      if (!res.ok) {
        const msg =
          typeof d.error === 'string'
            ? d.error
            : d.message
              ? `${d.message}: ${JSON.stringify(d.error)}`
              : 'Publish failed — check terminal for exact error'
        throw new Error(msg)
      }

      router.push('/vendor/dashboard?published=1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button
          onClick={() => router.push('/vendor/dashboard')}
          className="flex h-10 w-9 items-center justify-center text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-syne text-[16px] font-bold text-foreground">Add Product</h1>
        <button className="flex h-10 w-9 items-center justify-center text-muted-foreground" aria-label="Help">
          <HelpCircle size={20} />
        </button>
      </header>

      <div className="mx-auto w-full max-w-[640px] space-y-4 px-4 pt-4">
        {/* Hint */}
        <div className="flex items-center gap-2.5 rounded-xl border border-surface-3 bg-surface-2 p-3">
          <Info size={16} className="shrink-0 text-primary" />
          <p className="text-[12px] text-muted-foreground">
            Complete all sections for maximum visibility in search results
          </p>
        </div>

        {/* Photos */}
        <section className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <h2 className="font-syne text-[14px] font-bold text-foreground">Product Photos</h2>
          <div className="mt-3 flex gap-2">
            {photoUrls.map((url, i) => (
              <div key={i} className="relative h-[72px] w-[72px] shrink-0">
                {url ? (
                  <>
                    <img
                      src={cloudinaryThumb(url)}
                      alt={`Photo ${i + 1}`}
                      className="h-full w-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => clearPhotoAt(i)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white"
                    >
                      <X size={10} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-0.5 left-0 right-0 text-center font-mono text-[8px] text-white drop-shadow">
                        cover
                      </span>
                    )}
                  </>
                ) : (
                  <ImageUpload
                    folder="loka/products"
                    onUpload={(u) => setPhotoAt(i, u)}
                    onError={setError}
                    className="h-full w-full"
                  >
                    <div className={cn(
                      'flex h-[72px] w-[72px] flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed transition-colors',
                      i === 0 ? 'border-primary bg-surface-2' : 'border-surface-3 bg-surface-2',
                    )}>
                      {i === 0 ? (
                        <>
                          <div className="flex items-center gap-0.5 text-primary">
                            <Plus size={14} /><Camera size={14} />
                          </div>
                          <span className="font-mono text-[9px] text-primary">Cover</span>
                        </>
                      ) : (
                        <Plus size={18} className="text-muted-foreground" />
                      )}
                    </div>
                  </ImageUpload>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            First photo is cover · Up to 5 photos · Max 5 MB each
          </p>
        </section>

        {/* Product details */}
        <section className="space-y-3 rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <h2 className="font-syne text-[14px] font-bold text-foreground">Product Details</h2>

          <div className={cn(
            'flex h-12 items-center gap-2.5 rounded-xl border bg-surface-2 px-3',
            name.length > 0 ? 'border-primary' : 'border-surface-3',
          )}>
            <Tag size={16} className="shrink-0 text-muted-foreground" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samsung Galaxy A32 (Unlocked)"
              className="h-full w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <span className="text-primary">*</span>
          </div>

          {/* Category */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCatOpen((o) => !o)}
              className="flex h-12 w-full items-center gap-2.5 rounded-xl border border-surface-3 bg-surface-2 px-3 text-left"
            >
              <Tag size={16} className="shrink-0 text-muted-foreground" />
              <span className={cn('flex-1 text-[14px]', selectedCat ? 'text-foreground' : 'text-muted-foreground')}>
                {selectedCat?.name_en ?? 'Select category (optional)'}
              </span>
              <ArrowDown size={16} className={cn('text-muted-foreground transition-transform', catOpen && 'rotate-180')} />
            </button>
            {catOpen && categories.length > 0 && (
              <div className="absolute left-0 right-0 top-[52px] z-20 max-h-[200px] overflow-y-auto rounded-xl border border-surface-3 bg-surface-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => { setCategoryId(null); setCatOpen(false) }}
                  className="flex h-11 w-full items-center px-4 text-[13px] text-muted-foreground hover:bg-surface-2"
                >
                  No category
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setCategoryId(c.id); setCatOpen(false) }}
                    className={cn(
                      'flex h-11 w-full items-center px-4 text-[13px] transition-colors',
                      c.id === categoryId ? 'bg-primary/15 text-primary' : 'text-foreground hover:bg-surface-2',
                    )}
                  >
                    {c.name_en}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Condition */}
          <div>
            <p className="mb-1.5 text-[12px] text-muted-foreground">Condition</p>
            <div className="flex gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCondition(c.value)}
                  className={cn(
                    'flex-1 rounded-xl py-2.5 text-[13px] font-medium transition-colors',
                    condition === c.value ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted-foreground',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className={cn(
              'flex gap-2.5 rounded-xl border bg-surface-2 p-3',
              description.length > 0 ? 'border-primary' : 'border-surface-3',
            )}>
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

        {/* Pricing */}
        <section className="space-y-3 rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <h2 className="font-syne text-[14px] font-bold text-foreground">Pricing</h2>

          <div>
            <div className={cn(
              'flex h-12 items-center gap-2.5 rounded-xl border bg-surface-2 px-3',
              price ? 'border-primary' : 'border-surface-3',
            )}>
              <span className="font-mono text-[13px] text-primary">XAF</span>
              <input
                value={price}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '')
                  setPrice(digits ? parseInt(digits, 10).toLocaleString() : '')
                }}
                inputMode="numeric"
                placeholder="0"
                className="h-full w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
              Whole numbers only — e.g. 45,000
            </p>
          </div>

          <div className="rounded-xl bg-surface-2 p-3.5">
            <div className="flex items-center gap-2.5">
              <MessageSquare size={16} className="text-primary" />
              <div className="flex-1">
                <p className="text-[14px] text-foreground">Allow Bargaining</p>
                <p className="text-[11px] text-muted-foreground">Buyers can send you price offers</p>
              </div>
              <Toggle on={bargain} onClick={() => setBargain((b) => !b)} />
            </div>
          </div>
        </section>

        {/* Phase 2 locked */}
        <section className="relative overflow-hidden rounded-xl bg-surface-2 p-3.5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span className="font-syne text-[14px] font-bold text-foreground">AI Description Generator</span>
            <span className="rounded-full bg-[#8b5cf6]/15 px-2 py-0.5 font-mono text-[9px] text-[#a78bfa]">Phase 2</span>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Upload a photo and AI will write your product description in English and French.
          </p>
          <div className="absolute inset-0 flex items-center justify-center bg-surface-2/60">
            <Lock size={24} className="text-muted-foreground" />
          </div>
        </section>

        {error && (
          <p className="rounded-xl border border-error bg-error/10 px-4 py-3 text-[13px] text-error">
            {error}
          </p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[640px] border-t border-surface-3 bg-surface-1 p-4">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            'flex h-[52px] w-full items-center justify-center gap-2 rounded-xl font-syne text-[15px] font-semibold transition-colors',
            canSubmit
              ? 'bg-primary text-primary-foreground hover:bg-primary-dark'
              : 'cursor-not-allowed bg-surface-3 text-muted-foreground',
          )}
        >
          <Upload size={18} />
          {submitting ? 'Publishing...' : 'Publish Product'}
        </button>
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
      <span className={cn(
        'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
        on ? 'translate-x-[22px]' : 'translate-x-0.5',
      )} />
    </button>
  )
}