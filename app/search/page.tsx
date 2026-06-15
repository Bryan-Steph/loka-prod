'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, X, SlidersHorizontal, SearchX } from 'lucide-react'
import { BottomNav } from '@/components/ui/bottom-nav'
import { ProductListCard, type ApiProduct } from '@/components/product/product-card'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const SUGGESTIONS = ['Phones', 'Electronics', 'Fashion', 'Food']

export default function SearchPage() {
  const [query, setQuery]       = useState('')
  const [bargainOnly, setBargainOnly] = useState(false)
  const [results, setResults]   = useState<ApiProduct[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = (q: string, bargain: boolean) => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('limit', '20')
    if (q) params.set('q', q)
    if (bargain) params.set('bargain_ok', 'true')

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.products ?? [])
        setTotal(d.total ?? 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { doSearch('', false) }, [])

  const handleChange = (val: string) => {
    setQuery(val)
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => doSearch(val, bargainOnly), 350)
  }

  const toggleBargain = () => {
    const next = !bargainOnly
    setBargainOnly(next)
    doSearch(query, next)
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-background/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex h-10 w-9 items-center justify-center text-foreground" aria-label="Go back">
            <ArrowLeft size={22} />
          </Link>
          <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-primary bg-surface-2 px-3">
            <Search size={16} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => handleChange(e.target.value)}
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
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3">
          <button
            onClick={toggleBargain}
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] transition-colors',
              bargainOnly
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-surface-3 bg-surface-1 text-muted-foreground',
            )}
          >
            Bargain OK
          </button>
        </div>

        {loading ? (
          <div className="mt-4 flex flex-col gap-3 px-4">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center px-4 pt-20 text-center">
            <SearchX size={48} className="text-muted-foreground" />
            <h2 className="mt-4 font-syne text-[18px] font-bold text-foreground">No results found</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Try different keywords or browse categories</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
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
                {total} result{total !== 1 ? 's' : ''}
                {query ? ` for '${query}'` : ''}
                {bargainOnly ? ' · Bargain only' : ''}
              </p>
              <button className="font-mono text-[11px] text-foreground">Relevance ▾</button>
            </div>
            <div className="mt-3 flex flex-col gap-3 px-4">
              {results.map((p) => <ProductListCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>

      <BottomNav active="search" />
    </div>
  )
}