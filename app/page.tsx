'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Bell, User, Search } from 'lucide-react'
import { LOKAWordmark } from '@/components/ui/loka-wordmark'
import { BottomNav } from '@/components/ui/bottom-nav'
import { CategoryChip } from '@/components/product/category-chip'
import { ProductCard } from '@/components/product/product-card'
import { VendorCard } from '@/components/vendor/vendor-card'
import {
  ProductCardSkeleton,
  VendorCardSkeleton,
} from '@/components/ui/skeleton'
import {
  CATEGORIES,
  TRENDING_PRODUCTS,
  VERIFIED_VENDORS,
} from '@/lib/data'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lang, setLang] = useState<'EN' | 'FR'>('EN')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="min-h-screen pb-20">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <div className="flex h-14 items-center justify-between">
          <span className="font-syne text-[26px] font-extrabold text-primary">
            LOKA
          </span>
          <span className="flex items-center gap-1 rounded-full border border-surface-3 bg-surface-2 px-3 py-1.5 font-mono text-[11px] text-foreground">
            <MapPin size={12} className="text-primary" />
            Bamenda
          </span>
          <div className="flex items-center gap-1">
            <button
              className="flex h-10 w-10 items-center justify-center text-muted-foreground"
              aria-label="Notifications"
            >
              <Bell size={22} />
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center text-muted-foreground"
              aria-label="Profile"
            >
              <User size={22} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px]">
        {/* Language row */}
        <div className="flex justify-end px-4 pt-2">
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <button
              onClick={() => setLang('EN')}
              className={lang === 'EN' ? 'text-primary' : 'text-muted-foreground'}
            >
              EN
            </button>
            <span className="text-surface-3">|</span>
            <button
              onClick={() => setLang('FR')}
              className={lang === 'FR' ? 'text-primary' : 'text-muted-foreground'}
            >
              FR
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pt-2">
          <Link
            href="/search"
            className="flex h-12 items-center gap-2.5 rounded-xl border border-surface-3 bg-surface-2 px-3"
          >
            <Search size={18} className="text-muted-foreground" />
            <span className="flex-1 text-[14px] text-muted-foreground">
              Search products, vendors...
            </span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary">
              Bamenda
            </span>
          </Link>
        </div>

        {/* Category chips */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>

        {/* Hero banner */}
        <div className="px-4 pt-4">
          <div className="relative h-[140px] overflow-hidden rounded-2xl border border-surface-3 bg-surface-1 p-5">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-2/3"
              style={{
                background:
                  'linear-gradient(90deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0) 100%)',
              }}
            />
            <div className="relative">
              <h2 className="font-syne text-[20px] font-bold text-foreground">
                Bamenda&apos;s Market, Now Online
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Verified vendors. Safe bargaining. Real pickup.
              </p>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/search"
                  className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground"
                >
                  Browse Products
                </Link>
                <Link
                  href="/register/vendor"
                  className="rounded-lg border border-surface-3 px-3 py-1.5 text-[12px] font-medium text-foreground"
                >
                  Sell with LOKA
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Vendors */}
        <section className="pt-6">
          <SectionHeader title="Verified Vendors" />
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <VendorCardSkeleton key={i} />
                ))
              : VERIFIED_VENDORS.map((v) => (
                  <VendorCard
                    key={v.id}
                    name={v.name}
                    category={v.category}
                    products={v.products}
                  />
                ))}
          </div>
        </section>

        {/* Trending products */}
        <section className="pt-6">
          <SectionHeader title="Trending in Bamenda" />
          <div className="mt-3 grid grid-cols-2 gap-2 px-4">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : TRENDING_PRODUCTS.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
          </div>
        </section>
      </div>

      {/* Dev: toggle loading */}
      <button
        onClick={() => setIsLoading((l) => !l)}
        className={cn(
          'fixed bottom-20 right-4 z-40 rounded-full border border-surface-3 bg-surface-1 px-3 py-1.5 font-mono text-[10px]',
          isLoading ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        Toggle Loading
      </button>

      <BottomNav active="home" />
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-4">
      <h3 className="font-syne text-[14px] font-bold text-foreground">{title}</h3>
      <button className="text-[12px] text-primary">See all →</button>
    </div>
  )


}
