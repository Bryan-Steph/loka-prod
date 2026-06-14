'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Store, Edit2, Package, MapPin, Clock,
  BadgeCheck, Eye, ArrowLeft,
} from 'lucide-react'

interface VendorData {
  id: string
  shop_name: string
  shop_description: string | null
  shop_avatar_url: string | null
  address_text: string | null
  verification_status: string
  operating_hours: { opens: string | null; closes: string | null } | null
  categories: { name_en: string } | null
  total_views: number
}

interface Stats {
  activeProducts: number
  totalViews: number
}

export default function MyShopPage() {
  const router = useRouter()
  const [vendor, setVendor] = useState<VendorData | null>(null)
  const [stats, setStats]   = useState<Stats>({ activeProducts: 0, totalViews: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/vendors/me').then((r) => r.json()),
      fetch('/api/vendors/me/stats').then((r) => r.json()),
    ])
      .then(([vd, sd]) => {
        if (vd.vendor) setVendor(vd.vendor)
        if (sd.stats) setStats(sd.stats)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <Store size={48} className="text-muted-foreground" />
        <p className="text-center text-[14px] text-muted-foreground">
          Your shop profile hasn't been set up yet.
        </p>
        <button
          onClick={() => router.push('/shop')}
          className="rounded-xl bg-primary px-6 py-3 font-syne text-[14px] font-semibold text-primary-foreground"
        >
          Complete Onboarding
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button
          onClick={() => router.push('/vendor/dashboard')}
          className="flex h-10 w-9 items-center justify-center text-foreground"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-syne text-[18px] font-bold text-foreground">My Shop</h1>
        <button
          onClick={() => router.push('/vendor/settings')}
          className="flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-[13px] text-primary"
        >
          <Edit2 size={14} />
          Edit
        </button>
      </header>

      <div className="mx-auto max-w-[640px] space-y-4 px-4 pt-5">
        {/* Shop identity card */}
        <div className="rounded-2xl border border-surface-3 bg-surface-1 p-5">
          <div className="flex items-start gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-surface-2">
              {vendor.shop_avatar_url ? (
                <img
                  src={vendor.shop_avatar_url}
                  alt={vendor.shop_name}
                  className="h-full w-full rounded-2xl object-cover"
                />
              ) : (
                <Store size={32} className="text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-syne text-[20px] font-bold text-foreground">
                  {vendor.shop_name}
                </h2>
                {vendor.verification_status === 'approved' && (
                  <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 font-mono text-[10px] text-success">
                    <BadgeCheck size={11} /> Verified
                  </span>
                )}
              </div>
              {vendor.categories && (
                <p className="mt-0.5 text-[13px] text-primary">{vendor.categories.name_en}</p>
              )}
              {vendor.shop_description && (
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {vendor.shop_description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-surface-3 bg-surface-1 p-4">
            <Package size={22} className="text-primary" />
            <span className="font-mono text-[28px] leading-tight text-primary">{stats.activeProducts}</span>
            <span className="text-[11px] text-muted-foreground">Active Products</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-surface-3 bg-surface-1 p-4">
            <Eye size={22} className="text-primary" />
            <span className="font-mono text-[28px] leading-tight text-primary">{stats.totalViews}</span>
            <span className="text-[11px] text-muted-foreground">Total Views</span>
          </div>
        </div>

        {/* Location */}
        {vendor.address_text && (
          <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
            <div className="mb-2 flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              <h3 className="font-syne text-[14px] font-bold text-foreground">Shed Location</h3>
            </div>
            <p className="text-[13px] text-muted-foreground">{vendor.address_text}</p>
          </div>
        )}

        {/* Opening hours */}
        {vendor.operating_hours && (vendor.operating_hours.opens || vendor.operating_hours.closes) && (
          <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <h3 className="font-syne text-[14px] font-bold text-foreground">Opening Hours</h3>
            </div>
            <p className="text-[13px] text-muted-foreground">
              Opens {vendor.operating_hours.opens ?? '—'} · Closes {vendor.operating_hours.closes ?? '—'}
            </p>
          </div>
        )}

        {/* Products CTA */}
        <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-syne text-[14px] font-bold text-foreground">Products</h3>
            <Link
              href="/vendor/products/new"
              className="rounded-lg bg-primary px-3 py-1.5 font-mono text-[11px] text-primary-foreground"
            >
              + Add Product
            </Link>
          </div>
          {stats.activeProducts === 0 ? (
            <p className="py-3 text-center text-[13px] text-muted-foreground">
              No products listed yet. Add your first product to go live.
            </p>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              {stats.activeProducts} active product{stats.activeProducts !== 1 ? 's' : ''} visible to buyers.
            </p>
          )}
        </div>

        {/* Verification status banner */}
        {vendor.verification_status === 'pending' && (
          <div className="rounded-xl border-l-4 border-primary bg-surface-2 p-4">
            <p className="font-syne text-[14px] font-semibold text-foreground">Verification Pending</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              A LOKA admin is reviewing your video verification. Once approved, your products appear in the
              home feed and search. This typically takes 24–48 hours.
            </p>
          </div>
        )}

        {/* Browse LOKA */}
        <Link
          href="/"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-surface-3 bg-surface-1 text-[14px] text-foreground"
        >
          <Store size={16} className="text-primary" />
          Browse LOKA Marketplace
        </Link>
      </div>
    </div>
  )
}