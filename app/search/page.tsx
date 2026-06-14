'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, X, SlidersHorizontal, SearchX } from 'lucide-react'
import { BottomNav } from '@/components/ui/bottom-nav'
import { ProductListCard } from '@/components/product/product-card'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import type { Product } from '@/lib/data'
import { cn } from '@/lib/utils'

const ACTIVE_FILTERS_DISPLAY = ['Verified Only', 'Bargain OK']
const SUGGESTIONS = ['Phones', 'Electronics', 'Fashion', 'Food']

function toListProduct(p: Record<string, unknown>): Product {
  const v   = p.vendors   as Record<string, unknown> | null
  const cat = p.categories as Record<string, unknown> | null
  const cond = p.condition as string
  return {
    id:         p.id      as string,
    name:       p.name_en as string,
    price:      p.price   as number,
    vendor:     (v?.shop_name    as string) ?? '',
    shed:       (v?.address_text as string) ?? '',
    address:    (v?.address_text as string) ?? '',
    category:   (cat?.name_en   as string) ?? '',
    verified:   v?.verification_status === 'approved',
    bargainOk:  p.bargaining_allowed as boolean,
    condition:  cond === 'new' ? 'New' : cond === 'refurbished' ? 'Refurbished' : 'Used',
    lastActive: 'Recently active',
  }
}

export default function SearchPage() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = (q: string) => {
    setLoading(true)
    const qs = q ? `?q=${encodeURIComponent(q)}&limit=20` : '?limit=20'
    fetch(`/api/products${qs}`)
      .then(r => r.json())
      .then(d => {
        setResults((d.products ?? []).map(toListProduct))
        setTotal(d.total ?? 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  // Fetch all on mount
  useEffect(() => { doSearch('') }, [])

  const handleChange = (val: string) => {
    setQuery(val)
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => doSearch(val), 350)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-background/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex h-10 w-9 items-center justify-center text-foreground" aria-label="Go back">
            <ArrowLeft size={22} />
          </Link>
          <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-primary bg-surface-2 px-3">
            <Search size={16} className="text-muted-foreground" />
            <input
              value={query}
              onChange={e => handleChange(e.target.value)}
              className="h-full w-full bg-transparent text-[14px] text-foreground focus:outline-none"
              placeholder="Search products, vendors..."
              autoFocus
            />
            {query && (
              <button onClick={() => handleChange('')} aria-label="Clear">
                <X size={16} className="text-muted-foreground" />
              </button>
            )}
          </div>
          <button className="flex h-10 w-9 items-center justify-center text-foreground" aria-label="Filters">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px]">
        {/* Filter chips — visual only, Sprint 4 wires them */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3">
          {ACTIVE_FILTERS_DISPLAY.map(f => (
            <span key={f} className="flex shrink-0 items-center gap-1 rounded-full border border-surface-3 bg-surface-1 px-3 py-1.5 text-[12px] text-muted-foreground">
              {f}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="mt-4 flex flex-col gap-3 px-4">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center px-4 pt-20 text-center">
            <SearchX size={48} className="text-muted-foreground" />
            <h2 className="mt-4 font-syne text-[18px] font-bold text-foreground">No results found</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Try different keywords or browse categories
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleChange(s)}
                  className="rounded-full border border-surface-3 bg-surface-1 px-3 py-1.5 text-[12px] text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 pt-4">
              <p className="text-[13px] text-muted-foreground">
                {total} result{total !== 1 ? 's' : ''}{query ? ` for '${query}'` : ''}
              </p>
              <button className="font-mono text-[11px] text-foreground">Relevance ▾</button>
            </div>
            <div className="mt-3 flex flex-col gap-3 px-4">
              {results.map(p => <ProductListCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>

      <BottomNav active="search" />
    </div>
  )
}