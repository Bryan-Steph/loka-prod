'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Heart,
  ChevronDown,
  SlidersHorizontal,
  TrendingDown,
} from 'lucide-react'
import { BottomNav } from '@/components/buyer/BottomNav'
import {
  ProductCard,
  ProductCardSkeleton,
  type Product,
} from '@/components/buyer/ProductCard'

const WISHLIST: Product[] = [
  {
    name: 'Samsung Galaxy A32',
    price: '45,000 XAF',
    vendor: 'Mama Agnes',
    verified: true,
    bargainOk: true,
    addedAgo: 'Added 3 days ago',
  },
  {
    name: 'JBL-style Speaker',
    price: '12,000 XAF',
    vendor: 'Tech Corner',
    verified: true,
    bargainOk: true,
    addedAgo: 'Added 4 days ago',
  },
  {
    name: 'Ankara Print Fabric 3yds',
    price: '4,500 XAF',
    vendor: 'Fabrics Palace',
    addedAgo: 'Added 5 days ago',
  },
  {
    name: 'Nike-style Sneakers (42)',
    price: '9,500 XAF',
    vendor: 'SportZone Bamenda',
    bargainOk: true,
    addedAgo: 'Added 1 week ago',
  },
  {
    name: 'Power Bank 20,000mAh',
    price: '8,000 XAF',
    vendor: 'Power Up Store',
    addedAgo: 'Added 1 week ago',
  },
  {
    name: 'iPhone 13 Case',
    price: '1,800 XAF',
    vendor: 'Mobile Accessories Hub',
    verified: true,
    addedAgo: 'Added 2 weeks ago',
  },
]

export default function WishlistPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState(WISHLIST)
  const totalSaved = 8

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-background pb-20">
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-surface-1">
        <div className="flex items-center justify-between px-4 py-3.5">
          <h1 className="font-heading text-xl text-foreground">Wishlist</h1>
          <span className="flex items-center gap-1">
            <Heart size={18} className="fill-primary text-primary" />
            <span className="font-mono text-[11px] text-primary">
              {totalSaved} saved
            </span>
          </span>
        </div>
      </header>

      {/* Sort row */}
      <div className="flex items-center justify-between px-4 py-3">
        <button className="flex items-center gap-1 rounded-lg border border-surface-3 bg-surface-2 px-3 py-1.5 font-mono text-[11px] text-foreground">
          Sort: Recent
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
        <button aria-label="Filter" className="text-muted-foreground">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* Price drop banner */}
      <Link
        href="#"
        className="mx-4 flex items-center gap-3 rounded-xl border-l-[3px] border-primary bg-surface-1 p-3.5"
      >
        <TrendingDown size={18} className="shrink-0 text-primary" />
        <p className="flex-1 text-[13px] text-foreground">
          Samsung A32 dropped from 48,000 to 45,000 XAF
        </p>
        <span className="text-xs text-primary">View →</span>
      </Link>

      {items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <Heart size={56} className="text-muted-foreground" />
          <p className="mt-4 font-heading text-xl text-muted-foreground">
            Nothing saved yet
          </p>
          <p className="mt-1 max-w-[240px] text-[13px] text-muted-foreground">
            Tap the heart on any product to save it here
          </p>
          <Link
            href="/feed"
            className="mt-5 flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-heading text-sm font-semibold text-primary-foreground"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 px-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : items.map((p) => (
                  <ProductCard
                    key={p.name}
                    product={p}
                    showHeart
                    onRemove={() =>
                      setItems((prev) =>
                        prev.filter((x) => x.name !== p.name),
                      )
                    }
                  />
                ))}
          </div>
          {!loading ? (
            <p className="py-4 text-center font-mono text-[11px] text-muted-foreground">
              See 2 more →
            </p>
          ) : null}
        </>
      )}

      <BottomNav active="home" />
    </div>
  )
}
