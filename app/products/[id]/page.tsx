'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Share2, Heart, ImageIcon, MessageSquare,
  Package, MapPin, AlertTriangle, ShoppingCart,
  ChevronLeft, ChevronRight, CheckCircle2, Loader2,
} from 'lucide-react'
import { VendorMap } from '@/components/ui/VendorMap'
import { VerifiedBadge } from '@/components/ui/verified-badge'
import { cn } from '@/lib/utils'
import { formatXAF } from '@/lib/data'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params?.id as string

  const [product, setProduct]         = useState<Record<string, unknown> | null>(null)
  const [saved, setSaved]             = useState(false)
  const [loading, setLoading]         = useState(true)
  const [photoIndex, setPhotoIndex]   = useState(0)
  const [reported, setReported]       = useState(false)
  const [startingChat, setStartingChat] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch(`/api/products/${id}/wishlist`).then((r) => r.json()),
    ])
      .then(([pd, wd]) => {
        if (pd.product) setProduct(pd.product)
        setSaved(wd.saved ?? false)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const toggleSave = async () => {
    const res = await fetch(`/api/products/${id}/wishlist`, { method: 'POST' })
    const d   = await res.json()
    if (res.ok) setSaved(d.saved)
  }

  const startBargain = async () => {
    setStartingChat(true)
    try {
      const res = await fetch('/api/conversations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ product_id: id }),
      })
      if (res.status === 401) { router.push(`/login?next=/products/${id}`); return }
      const d = await res.json()
      if (res.ok && d.conversation_id) router.push(`/chat/${d.conversation_id}`)
    } finally {
      setStartingChat(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
          <button onClick={() => router.back()} className="flex h-10 w-9 items-center justify-center">
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <span className="font-syne text-[16px] font-bold text-foreground">Product Details</span>
          <div className="w-9" />
        </header>
        <div className="flex h-[320px] items-center justify-center bg-surface-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-[14px] text-muted-foreground">Product not found.</p>
        <Link href="/" className="text-[13px] text-primary">← Back to home</Link>
      </div>
    )
  }

  const vendor       = product.vendors    as Record<string, unknown> | null
  const category     = product.categories as Record<string, unknown> | null
  const photoUrls    = (product.photo_urls as string[]) ?? []
  const currentPhoto = photoUrls[photoIndex] ?? null
  const condLabel    = (product.condition as string) === 'new' ? 'New' : (product.condition as string) === 'refurbished' ? 'Refurbished' : 'Used'
  const isInStock    = (product.stock_status as string) === 'in_stock'
  const vendorId     = vendor?.id as string | undefined
  const vendorLat    = vendor?.latitude  as number | null | undefined
  const vendorLng    = vendor?.longitude as number | null | undefined

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button onClick={() => router.back()} className="flex h-10 w-9 items-center justify-center text-foreground" aria-label="Go back">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-syne text-[16px] font-bold text-foreground">Product Details</h1>
        <div className="flex items-center gap-1">
          <button className="flex h-10 w-9 items-center justify-center text-muted-foreground" aria-label="Share">
            <Share2 size={20} />
          </button>
          <button onClick={toggleSave} className="flex h-10 w-9 items-center justify-center" aria-label={saved ? 'Remove from wishlist' : 'Save'}>
            <Heart size={20} className={cn(saved ? 'fill-primary text-primary' : 'text-muted-foreground')} />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[640px]">
        {/* Carousel */}
        <div className="relative flex h-[320px] items-center justify-center overflow-hidden bg-surface-2">
          {currentPhoto
            ? <img src={currentPhoto} alt={product.name_en as string} className="h-full w-full object-cover object-top" />
            : <ImageIcon size={32} className="text-muted-foreground" />
          }
          {photoUrls.length > 1 && (
            <>
              <button onClick={() => setPhotoIndex((i) => (i - 1 + photoUrls.length) % photoUrls.length)}
                className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 backdrop-blur"
                aria-label="Previous photo"
              >
                <ChevronLeft size={20} className="text-foreground" />
              </button>
              <button onClick={() => setPhotoIndex((i) => (i + 1) % photoUrls.length)}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 backdrop-blur"
                aria-label="Next photo"
              >
                <ChevronRight size={20} className="text-foreground" />
              </button>
            </>
          )}
        </div>

        {photoUrls.length > 1 && (
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex gap-1.5">
              {photoUrls.map((_, i) => (
                <button key={i} onClick={() => setPhotoIndex(i)} aria-label={`Photo ${i + 1}`}
                  className={cn('h-1.5 rounded-full transition-all', i === photoIndex ? 'w-5 bg-primary' : 'w-2.5 bg-surface-3')} />
              ))}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">{photoIndex + 1} / {photoUrls.length}</span>
          </div>
        )}

        {/* Core info */}
        <div className="px-4 pt-3">
          <h2 className="font-syne text-[20px] font-bold text-foreground">{product.name_en as string}</h2>
          <div className="mt-2 flex items-center gap-2.5">
            <span className="font-mono text-[24px] text-primary">{formatXAF(product.price as number)}</span>
            <span className="rounded-full border border-surface-3 bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{condLabel}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {(product.bargaining_allowed as boolean) ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/15 px-2.5 py-1 font-mono text-[11px] text-success">
                <MessageSquare size={12} /> Bargaining Open
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-surface-3 bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                Fixed Price
              </span>
            )}
            <span className={cn('inline-flex items-center gap-1.5 font-mono text-[11px]', isInStock ? 'text-success' : 'text-error')}>
              <Package size={12} />{isInStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Vendor card — guarded against missing vendor.id */}
        {vendor && (
          <div className="px-4 pt-5">
            <Link
              href={vendorId ? `/vendors/${vendorId}` : '#'}
              onClick={(e) => { if (!vendorId) e.preventDefault() }}
              className={cn(
                'block rounded-2xl border border-surface-3 bg-surface-1 p-4 transition-colors',
                vendorId && 'hover:border-primary/40',
              )}
            >
              <div className="flex items-start gap-3">
                <div className="relative h-11 w-11 shrink-0">
                  {vendor.shop_avatar_url
                    ? <img src={vendor.shop_avatar_url as string} alt="" className="h-full w-full rounded-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-2"><Package size={20} className="text-muted-foreground" /></div>
                  }
                  {vendor.verification_status === 'approved' && (
                    <VerifiedBadge size="sm" className="absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-syne text-[15px] font-bold text-foreground">{vendor.shop_name as string}</h3>
                  {!!(vendor.address_text as string | null) && (
                    <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                      <MapPin size={11} />{vendor.address_text as string}
                    </p>
                  )}
                </div>
                {vendorId && <span className="shrink-0 text-[12px] text-primary">View →</span>}
              </div>

              {vendorLat != null && vendorLng != null && (
                <div className="mt-3" onClick={(e) => e.preventDefault()}>
                  <VendorMap lat={vendorLat} lng={vendorLng} label={vendor.shop_name as string} className="h-[100px] w-full" />
                </div>
              )}
            </Link>
          </div>
        )}

        {!!(product.description_en as string | null) && (
          <div className="px-4 pt-5">
            <h3 className="font-syne text-[14px] font-bold text-foreground">Description</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{product.description_en as string}</p>
          </div>
        )}

        {category && (
          <div className="px-4 pt-3">
            <span className="rounded-full border border-surface-3 bg-surface-2 px-3 py-1 font-mono text-[11px] text-muted-foreground">
              {category.name_en as string}
            </span>
          </div>
        )}
      </div>

      {/* Sticky CTA row */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[1200px] items-center gap-2 border-t border-surface-3 bg-surface-1 p-4">
        <button
          onClick={() => setReported(true)}
          disabled={reported}
          className="flex flex-col items-center gap-0.5 px-1 text-muted-foreground disabled:text-success"
        >
          {reported ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span className="font-mono text-[10px]">{reported ? 'Reported' : 'Report'}</span>
        </button>
        <button
          onClick={startBargain}
          disabled={startingChat || !(product.bargaining_allowed as boolean)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary py-3 text-[14px] font-semibold text-primary disabled:opacity-50"
        >
          {startingChat ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
          Bargain
        </button>
        <Link
          href={`/pay/${id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-[14px] font-semibold text-primary-foreground"
        >
          <ShoppingCart size={16} />
          Buy Now
        </Link>
      </div>
    </div>
  )
}