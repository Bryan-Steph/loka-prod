'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, X, SlidersHorizontal, SearchX } from 'lucide-react'
import { BottomNav } from '@/components/ui/bottom-nav'
import { ProductListCard } from '@/components/product/product-card'
import { SEARCH_RESULTS } from '@/lib/data'
import { cn } from '@/lib/utils'

const ACTIVE_FILTERS = ['Electronics', 'Verified Only']
const INACTIVE_FILTERS = ['Bargain OK', 'Price: Low → High', 'New Only']
const SUGGESTIONS = ['Try: Phones', 'Electronics', 'Fashion']

export default function SearchPage() {
  const [query, setQuery] = useState('samsung')
  const [empty, setEmpty] = useState(false)

  return (
    <div className="min-h-screen pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-background/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex h-10 w-9 items-center justify-center text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </Link>
          <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-primary bg-surface-2 px-3">
            <Search size={16} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-full w-full bg-transparent text-[14px] text-foreground focus:outline-none"
              placeholder="Search products, vendors..."
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search">
                <X size={16} className="text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            className="flex h-10 w-9 items-center justify-center text-foreground"
            aria-label="Filters"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px]">
        {/* Active filters row */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3">
          {ACTIVE_FILTERS.map((f) => (
            <span
              key={f}
              className="flex shrink-0 items-center gap-1 rounded-full border border-primary bg-primary/20 px-3 py-1.5 text-[12px] text-primary"
            >
              {f}
              <X size={12} />
            </span>
          ))}
          {INACTIVE_FILTERS.map((f) => (
            <span
              key={f}
              className="shrink-0 whitespace-nowrap rounded-full border border-surface-3 bg-surface-1 px-3 py-1.5 text-[12px] text-muted-foreground"
            >
              {f}
            </span>
          ))}
        </div>

        {empty ? (
          <div className="flex flex-col items-center px-4 pt-20 text-center">
            <SearchX size={48} className="text-muted-foreground" />
            <h2 className="mt-4 font-syne text-[18px] font-bold text-foreground">
              No results found
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Try different keywords or remove filters
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-surface-3 bg-surface-1 px-3 py-1.5 text-[12px] text-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between px-4 pt-4">
              <p className="text-[13px] text-muted-foreground">
                14 results for &apos;{query || 'samsung'}&apos;
              </p>
              <button className="font-mono text-[11px] text-foreground">
                Relevance ▾
              </button>
            </div>

            {/* Results list */}
            <div className="mt-3 flex flex-col gap-3 px-4">
              {SEARCH_RESULTS.map((p) => (
                <ProductListCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dev: empty-state toggle */}
      <button
        onClick={() => setEmpty((e) => !e)}
        className={cn(
          'fixed bottom-20 right-4 z-40 rounded-full border border-surface-3 bg-surface-1 px-3 py-1.5 font-mono text-[10px]',
          empty ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        Toggle Empty
      </button>

      <BottomNav active="search" />
    </div>
  )
}
