'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Bell, Search } from 'lucide-react'
import { BottomNav } from '@/components/ui/bottom-nav'
import { CategoryChip } from '@/components/product/category-chip'
import { ProductCard } from '@/components/product/product-card'
import { VendorCard } from '@/components/vendor/vendor-card'
import { ProductCardSkeleton, VendorCardSkeleton } from '@/components/ui/skeleton'
import { CATEGORIES, type Product } from '@/lib/data'
import { Fragment } from 'react'

// ─── Helpers to transform API → component shapes ──────────────────────────────

function toProduct(p: Record<string, unknown>): Product {
  const v   = p.vendors   as Record<string, unknown> | null
  const cat = p.categories as Record<string, unknown> | null
  const cond = p.condition as string
  return {
    id:        p.id    as string,
    name:      p.name_en as string,
    price:     p.price as number,
    vendor:    (v?.shop_name   as string) ?? '',
    shed:      (v?.address_text as string) ?? '',
    category:  (cat?.name_en   as string) ?? '',
    verified:  v?.verification_status === 'approved',
    bargainOk: p.bargaining_allowed as boolean,
    condition: cond === 'new' ? 'New' : cond === 'refurbished' ? 'Refurbished' : 'Used',
  }
}

function toVendorCard(v: Record<string, unknown>) {
  const cat = v.categories as Record<string, unknown> | null
  return {
    id:       v.id        as string,
    name:     v.shop_name as string,
    category: (cat?.name_en as string) ?? 'Market',
    products: v.product_count as number ?? 0,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lang, setLang]         = useState<'EN' | 'FR'>('EN')
  const [products, setProducts] = useState<Product[]>([])
  const [vendors, setVendors]   = useState<ReturnType<typeof toVendorCard>[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/products?limit=12').then(r => r.json()),
      fetch('/api/vendors?limit=6').then(r => r.json()),
    ])
      .then(([pd, vd]) => {
        if (pd.products) setProducts(pd.products.map(toProduct))
        if (vd.vendors)  setVendors(vd.vendors.map(toVendorCard))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Client-side category filter — rough match on category name
  const displayed = activeCategory === 'All'
    ? products
    : products.filter(p =>
        p.category.toLowerCase().includes(activeCategory.toLowerCase().split(' ')[0])
      )

  return (
    <div className="min-h-screen pb-20">
      {/* Sticky top bar */}
    <header className="sticky top-0 z-30 border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
  <div className="flex h-14 items-center justify-between">
    <span className="font-syne text-[26px] font-extrabold text-primary">LOKA</span>
    <span className="flex items-center gap-1 rounded-full border border-surface-3 bg-surface-2 px-3 py-1.5 font-mono text-[11px] text-foreground">
      <MapPin size={12} className="text-primary" />
      Bamenda
    </span>
  </div>
</header> 

      <div className="mx-auto w-full max-w-[1200px]">
        {/* Language toggle */}
        <div className="flex justify-end px-4 pt-2">
          <div className="flex items-center gap-1 font-mono text-[10px]">
        {(['EN', 'FR'] as const).map((l, i) => (
  <Fragment key={l}>
    {i > 0 && <span className="text-surface-3">|</span>}
    <button
      onClick={() => setLang(l)}
      className={lang === l ? 'text-primary' : 'text-muted-foreground'}
    >
      {l}
    </button>
  </Fragment>
))}
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
              style={{ background: 'linear-gradient(90deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0) 100%)' }}
            />
            <div className="relative">
              <h2 className="font-syne text-[20px] font-bold text-foreground">
                Bamenda&apos;s Market, Now Online
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Verified vendors. Safe bargaining. Real pickup.
              </p>
              <div className="mt-3 flex gap-2">
                <Link href="/search" className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground">
                  Browse Products
                </Link>
                <Link href="/register/vendor" className="rounded-lg border border-surface-3 px-3 py-1.5 text-[12px] font-medium text-foreground">
                  Sell with LOKA
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Vendors */}
        <section className="pt-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-syne text-[14px] font-bold text-foreground">Verified Vendors</h3>
            <button className="text-[12px] text-primary">See all →</button>
          </div>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <VendorCardSkeleton key={i} />)
              : vendors.length > 0
                ? vendors.map((v) => (
                    <VendorCard key={v.id} name={v.name} category={v.category} products={v.products} />
                  ))
                : <p className="text-[13px] text-muted-foreground">No verified vendors yet.</p>
            }
          </div>
        </section>

        {/* Trending products */}
        <section className="pt-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-syne text-[14px] font-bold text-foreground">Trending in Bamenda</h3>
            <Link href="/search" className="text-[12px] text-primary">See all →</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 px-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : displayed.length > 0
                ? displayed.map((p) => <ProductCard key={p.id} product={p} />)
                : (
                  <div className="col-span-2 py-10 text-center">
                    <p className="text-[13px] text-muted-foreground">
                      {activeCategory === 'All'
                        ? 'No products listed yet. Vendors are being verified.'
                        : `No ${activeCategory} products found.`}
                    </p>
                  </div>
                )
            }
          </div>
        </section>
      </div>

      <BottomNav active="home" />
    </div>
  )
}