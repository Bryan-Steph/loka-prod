'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Store, MapPin, Clock,
  Heart, HeartOff, MessageSquare, Package, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VerifiedBadge }  from '@/components/ui/verified-badge'
import { VendorMap }      from '@/components/ui/VendorMap'
import { ProductCard }    from '@/components/product/product-card'
import { EmptyState }     from '@/components/ui/EmptyState'
import type { ApiProduct } from '@/components/product/product-card'

interface VendorDetail {
  id:                  string
  shop_name:           string
  shop_description:    string | null
  shop_avatar_url:     string | null
  address_text:        string | null
  latitude:            number | null
  longitude:           number | null
  verification_status: string
  operating_hours:     { opens?: string; closes?: string } | null
}

/* ── Skeleton ──────────────────────────────────────────────────────────────── */
function VendorPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[640px] animate-pulse px-4 pt-5">
      {/* Identity */}
      <div className="flex items-start gap-4">
        <div className="h-[72px] w-[72px] shrink-0 rounded-2xl bg-surface-2" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-5 w-2/3 rounded bg-surface-2" />
          <div className="h-3 w-1/2 rounded bg-surface-2" />
          <div className="h-3 w-1/3 rounded bg-surface-2" />
        </div>
      </div>
      {/* Description */}
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-surface-2" />
        <div className="h-3 w-4/5 rounded bg-surface-2" />
      </div>
      {/* Buttons */}
      <div className="mt-4 flex gap-2">
        <div className="h-11 flex-1 rounded-xl bg-surface-2" />
        <div className="h-11 flex-1 rounded-xl bg-surface-2" />
      </div>
      {/* Map placeholder */}
      <div className="mt-4 h-[140px] w-full rounded-xl bg-surface-2" />
      {/* Product grid */}
      <div className="mt-6">
        <div className="mb-3 h-4 w-24 rounded bg-surface-2" />
        <div className="grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[180px] rounded-2xl bg-surface-2" />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function VendorShopPage() {
  const params = useParams()
  const router = useRouter()
  const id     = params?.id as string

  const [vendor, setVendor]               = useState<VendorDetail | null>(null)
  const [products, setProducts]           = useState<ApiProduct[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [following, setFollowing]         = useState(false)
  const [loading, setLoading]             = useState(true)
  const [notFound, setNotFound]           = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [chatLoading, setChatLoading]     = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/vendors/${id}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return }
        const d = await r.json()
        if (d.vendor)                             setVendor(d.vendor)
        if (d.products)                           setProducts(d.products)
        if (typeof d.follower_count === 'number') setFollowerCount(d.follower_count)
        if (typeof d.is_following  === 'boolean') setFollowing(d.is_following)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const toggleFollow = async () => {
    setFollowLoading(true)
    try {
      const res = await fetch(`/api/vendors/${id}/follow`, { method: 'POST' })
      if (res.status === 401) { router.push(`/login?next=/vendors/${id}`); return }
      const d = await res.json()
      if (res.ok) {
        if (typeof d.following     === 'boolean') setFollowing(d.following)
        if (typeof d.follower_count === 'number') setFollowerCount(d.follower_count)
      }
    } finally {
      setFollowLoading(false)
    }
  }

  const openChat = async () => {
    if (!products[0]) return
    setChatLoading(true)
    try {
      const res = await fetch('/api/conversations', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ product_id: products[0].id }),
      })
      if (res.status === 401) { router.push(`/login?next=/vendors/${id}`); return }
      const d = await res.json()
      if (res.ok && d.conversation_id) router.push(`/chat/${d.conversation_id}`)
    } finally {
      setChatLoading(false)
    }
  }

  /* ─── Not found ──────────────────────────────────────────────────────── */
  if (!loading && (notFound || !vendor)) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex h-14 items-center px-4">
          <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center text-foreground">
            <ArrowLeft size={22} />
          </button>
        </header>
        <EmptyState
          variant="vendors"
          title="Shop not found"
          description="This shop may no longer be available or has moved."
          action={
            <Link href="/" className="text-[13px] text-primary">← Back to home</Link>
          }
        />
      </div>
    )
  }

  const hours = vendor?.operating_hours

  return (
    <div className="min-h-screen animate-in fade-in pb-10 duration-200">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="truncate font-syne text-[16px] font-bold text-foreground">
          {loading ? '…' : vendor?.shop_name}
        </h1>
      </header>

      {loading ? (
        <VendorPageSkeleton />
      ) : (
        <div className="mx-auto w-full max-w-[640px]">
          {/* Identity card */}
          <div className="flex items-start gap-4 px-4 pt-5">
            <div className="relative h-[72px] w-[72px] shrink-0">
              {vendor!.shop_avatar_url ? (
                <img
                  src={vendor!.shop_avatar_url}
                  alt={vendor!.shop_name}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-surface-2 text-muted-foreground">
                  <Store size={28} />
                </div>
              )}
              {vendor!.verification_status === 'approved' && (
                <VerifiedBadge size="sm" className="absolute -bottom-1 -right-1" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-syne text-[20px] font-bold leading-tight text-foreground">
                {vendor!.shop_name}
              </h2>
              {vendor!.address_text && (
                <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  <MapPin size={11} />
                  {vendor!.address_text}
                </p>
              )}
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                {followerCount} follower{followerCount !== 1 ? 's' : ''}
                {' · '}
                {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {vendor!.shop_description && (
            <p className="px-4 pt-3 text-[13px] leading-relaxed text-muted-foreground">
              {vendor!.shop_description}
            </p>
          )}

          {hours?.opens && hours?.closes && (
            <p className="flex items-center gap-2 px-4 pt-2 font-mono text-[11px] text-muted-foreground">
              <Clock size={12} className="text-primary" />
              Opens {hours.opens} — Closes {hours.closes}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 px-4 pt-4">
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={cn(
                'flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-[14px] font-semibold transition-colors disabled:opacity-60',
                following
                  ? 'border border-surface-3 text-foreground'
                  : 'bg-primary text-primary-foreground',
              )}
            >
              {followLoading
                ? <Loader2 size={16} className="animate-spin" />
                : following ? <HeartOff size={16} /> : <Heart size={16} />
              }
              {following ? 'Following' : 'Follow'}
            </button>

            <button
              onClick={openChat}
              disabled={chatLoading || products.length === 0}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary text-[14px] font-semibold text-primary disabled:opacity-50"
            >
              {chatLoading
                ? <Loader2 size={16} className="animate-spin" />
                : <MessageSquare size={16} />
              }
              Message
            </button>
          </div>

          {/* Map */}
          {vendor!.latitude != null && vendor!.longitude != null && (
            <div className="px-4 pt-4">
              <VendorMap
                lat={vendor!.latitude}
                lng={vendor!.longitude}
                label={vendor!.shop_name}
                className="h-[140px] w-full"
              />
            </div>
          )}

          {/* Products */}
          <div className="px-4 pt-6">
            <h3 className="font-syne text-[14px] font-bold text-foreground">
              Products ({products.length})
            </h3>
            {products.length === 0 ? (
              <EmptyState
                variant="products"
                title="No products yet"
                description="This vendor hasn't listed any products."
                className="mt-2"
              />
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}