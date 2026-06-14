'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Share2, Heart, ImageIcon, MessageSquare,
  Package, User, MapPin, AlertTriangle, ShoppingCart,
} from 'lucide-react'
import { MapPlaceholder } from '@/components/ui/placeholders'
import { VerifiedBadge } from '@/components/ui/verified-badge'
import { cn } from '@/lib/utils'
import { formatXAF } from '@/lib/data'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params?.id as string

  const [product, setProduct]       = useState<Record<string, unknown> | null>(null)
  const [saved, setSaved]           = useState(false)
  const [loading, setLoading]       = useState(true)
  const [photoIndex, setPhotoIndex] = useState(0)

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

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-9 items-center justify-center"
          >
            <ArrowLeft size={22} className="text-foreground" />
          </button>
          <span className="font-syne text-[16px] font-bold text-foreground">
            Product Details
          </span>
          <div className="w-9" />
        </header>
        <div className="flex h-[240px] items-center justify-center bg-surface-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-[14px] text-muted-foreground">Product not found.</p>
        <Link href="/" className="text-[13px] text-primary">
          ← Back to home
        </Link>
      </div>
    )
  }

  const vendor       = product.vendors    as Record<string, unknown> | null
  const category     = product.categories as Record<string, unknown> | null
  const photoUrls    = (product.photo_urls as string[]) ?? []
  const currentPhoto = photoUrls[photoIndex] ?? null

  const condLabel =
    (product.condition as string) === 'new'
      ? 'New'
      : (product.condition as string) === 'refurbished'
        ? 'Refurbished'
        : 'Used'

  const isInStock = (product.stock_status as string) === 'in_stock'

  return (
    <div className="min-h-screen pb-24">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-9 items-center justify-center text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-syne text-[16px] font-bold text-foreground">
          Product Details
        </h1>
        <div className="flex items-center gap-1">
          <button
            className="flex h-10 w-9 items-center justify-center text-muted-foreground"
            aria-label="Share"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={toggleSave}
            className="flex h-10 w-9 items-center justify-center"
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart
              size={20}
              className={cn(
                saved ? 'fill-primary text-primary' : 'text-muted-foreground',
              )}
            />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[640px]">
        {/* Photo */}
        <div className="relative flex h-[240px] items-center justify-center overflow-hidden bg-surface-2">
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt={product.name_en as string}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon size={32} className="text-muted-foreground" />
          )}
        </div>

        {/* Photo strip */}
        {photoUrls.length > 1 && (
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex gap-1.5">
              {photoUrls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  className={cn(
                    'h-2 w-2 rounded-full',
                    i === photoIndex ? 'bg-primary' : 'bg-surface-3',
                  )}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              {photoUrls.length} photo{photoUrls.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Core info */}
        <div className="px-4 pt-3">
          <h2 className="font-syne text-[20px] font-bold text-foreground">
            {product.name_en as string}
          </h2>
          <div className="mt-2 flex items-center gap-2.5">
            <span className="font-mono text-[24px] text-primary">
              {formatXAF(product.price as number)}
            </span>
            <span className="rounded-full border border-surface-3 bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {condLabel}
            </span>
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
            <span
              className={cn(
                'inline-flex items-center gap-1.5 font-mono text-[11px]',
                isInStock ? 'text-success' : 'text-error',
              )}
            >
              <Package size={12} />
              {isInStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Vendor card */}
        {vendor && (
          <div className="px-4 pt-5">
            <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
              <div className="flex items-start gap-3">
                <div className="relative h-11 w-11 shrink-0">
                  {vendor.shop_avatar_url ? (
                    <img
                      src={vendor.shop_avatar_url as string}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
                      <User size={20} />
                    </div>
                  )}
                  {vendor.verification_status === 'approved' && (
                    <VerifiedBadge
                      size="sm"
                      className="absolute -bottom-0.5 -right-0.5"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-syne text-[15px] font-bold text-foreground">
                    {vendor.shop_name as string}
                  </h3>
                  {/* FIX: cast to boolean before using unknown in JSX condition */}
                  {!!(vendor.address_text as string | null) && (
                    <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                      <MapPin size={11} />
                      {vendor.address_text as string}
                    </p>
                  )}
                </div>
              </div>
              <MapPlaceholder className="mt-3 h-25 w-full" label="Shed location map" />
            </div>
          </div>
        )}

        {/* Description */}
        {!!(product.description_en as string | null) && (
          <div className="px-4 pt-5">
            <h3 className="font-syne text-[14px] font-bold text-foreground">
              Description
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {product.description_en as string}
            </p>
          </div>
        )}

        {/* Category chip */}
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
        <button className="flex flex-col items-center gap-0.5 px-1 text-muted-foreground">
          <AlertTriangle size={18} />
          <span className="font-mono text-[10px]">Report</span>
        </button>
        {/* Sprint 4: will create conversation and navigate to /buyer/chat/[id] */}
        <Link
          href="/buyer/chat"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary py-3 text-[14px] font-semibold text-primary"
        >
          <MessageSquare size={16} />
          Bargain
        </Link>
        {/* Sprint 5: will wire Fapshi payment */}
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