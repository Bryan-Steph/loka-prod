'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, TrendingDown } from 'lucide-react'
import { BottomNav } from '@/components/ui/bottom-nav'
import { ProductCard } from '@/components/product/product-card'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { formatXAF, type Product } from '@/lib/data'

function toProduct(row: Record<string, unknown>): Product & { savedId: string } {
  const p   = row.products    as Record<string, unknown>
  const v   = p?.vendors      as Record<string, unknown> | null
  const cat = p?.categories   as Record<string, unknown> | null
  const cond = p?.condition   as string
  return {
    savedId:   row.id      as string,
    id:        p?.id       as string,
    name:      p?.name_en  as string,
    price:     p?.price    as number,
    vendor:    (v?.shop_name    as string) ?? '',
    shed:      (v?.address_text as string) ?? '',
    category:  (cat?.name_en   as string) ?? '',
    verified:  v?.verification_status === 'approved',
    bargainOk: p?.bargaining_allowed as boolean,
    condition: cond === 'new' ? 'New' : cond === 'refurbished' ? 'Refurbished' : 'Used',
  }
}

export default function WishlistPage() {
  const [items, setItems]   = useState<ReturnType<typeof toProduct>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products/saved')
      .then(r => r.json())
      .then(d => { if (d.saved) setItems(d.saved.map(toProduct)) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (productId: string) => {
    await fetch(`/api/products/${productId}/wishlist`, { method: 'POST' })
    setItems(prev => prev.filter(p => p.id !== productId))
  }

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-background pb-20">
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-surface-1">
        <div className="flex items-center justify-between px-4 py-3.5">
          <h1 className="font-syne text-xl text-foreground">Wishlist</h1>
          <span className="flex items-center gap-1">
            <Heart size={18} className="fill-primary text-primary" />
            <span className="font-mono text-[11px] text-primary">{items.length} saved</span>
          </span>
        </div>
      </header>

      {items.length === 0 && !loading ? (
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <Heart size={56} className="text-muted-foreground" />
          <p className="mt-4 font-syne text-xl text-muted-foreground">Nothing saved yet</p>
          <p className="mt-1 max-w-[240px] text-[13px] text-muted-foreground">
            Tap the heart on any product to save it here
          </p>
          <Link
            href="/"
            className="mt-5 flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-syne text-sm font-semibold text-primary-foreground"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 px-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : items.map(p => (
                <div key={p.id} className="relative">
                  <ProductCard product={p as any} />
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-surface-1/90"
                    aria-label="Remove from wishlist"
                  >
                    <Heart size={14} className="fill-primary text-primary" />
                  </button>
                </div>
              ))
          }
        </div>
      )}

      <BottomNav active="profile" />
    </div>
  )
}