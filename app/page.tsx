'use client'

import { Fragment, useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Search } from 'lucide-react'
import { BottomNav } from '@/components/ui/bottom-nav'
import { CategoryChip } from '@/components/product/category-chip'
import { ProductCard, type ApiProduct } from '@/components/product/product-card'
import { VendorCard } from '@/components/vendor/vendor-card'
import { ProductCardSkeleton, VendorCardSkeleton } from '@/components/ui/skeleton'
import { CATEGORIES } from '@/lib/data'
import { useAuthStore } from '@/store/authStore'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

interface ApiVendor {
  id: string
  shop_name: string
  shop_avatar_url: string | null
  verification_status: string
  categories: { id: string; name_en: string } | null
  product_count: number
}

export default function HomePage() {
  const { lang, setLang, t } = useLanguage()
  const user = useAuthStore((s) => s.user)

  const [activeCategory, setActiveCategory] = useState('All')
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [vendors, setVendors]   = useState<ApiVendor[]>([])
  const [followed, setFollowed] = useState<ApiProduct[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const requests: Promise<Record<string, unknown>>[] = [
      fetch('/api/products?limit=20').then((r) => r.json()),
      fetch('/api/vendors?limit=8').then((r) => r.json()),
    ]
    if (user) requests.push(fetch('/api/products?followed=true&limit=6').then((r) => r.json()))

    Promise.all(requests)
      .then(([pd, vd, fd]) => {
        if (pd.products) setProducts(pd.products as ApiProduct[])
        if (vd.vendors)  setVendors(vd.vendors as ApiVendor[])
        if (fd?.products) setFollowed(fd.products as ApiProduct[])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user?.id])

  const displayed = activeCategory === 'All'
    ? products
    : products.filter((p) =>
        (p.categories?.name_en ?? '').toLowerCase().includes(activeCategory.toLowerCase().split(' ')[0]),
      )

  return (
    <div className="min-h-screen pb-20">
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
            {(['en', 'fr'] as const).map((l, i) => (
              <Fragment key={l}>
                {i > 0 && <span className="text-surface-3">|</span>}
                <button
                  onClick={() => setLang(l)}
                  className={lang === l ? 'text-primary' : 'text-muted-foreground'}
                >
                  {l.toUpperCase()}
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
              {t('home.searchPlaceholder')}
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
              <h2 className="font-syne text-[20px] font-bold text-foreground">{t('home.heroTitle')}</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">{t('home.heroSubtitle')}</p>
              <div className="mt-3 flex gap-2">
                <Link href="/search" className="rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground">
                  {t('home.browseProducts')}
                </Link>
                <Link href="/register/vendor" className="rounded-lg border border-surface-3 px-3 py-1.5 text-[12px] font-medium text-foreground">
                  {t('home.sellWithLoka')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* From Vendors You Follow — only for logged-in buyers with follows */}
        {user && (followed.length > 0 || loading) && (
          <section className="pt-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="font-syne text-[14px] font-bold text-foreground">{t('home.fromVendorsYouFollow')}</h3>
              <Link href="/search" className="text-[12px] text-primary">{t('home.seeAll')} →</Link>
            </div>
            <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-[160px] shrink-0"><ProductCardSkeleton /></div>
                  ))
                : followed.map((p) => (
                    <div key={p.id} className="w-[160px] shrink-0">
                      <ProductCard product={p} />
                    </div>
                  ))
              }
            </div>
          </section>
        )}

        {/* Verified Vendors */}
        <section className="pt-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-syne text-[14px] font-bold text-foreground">{t('home.verifiedVendors')}</h3>
            <button className="text-[12px] text-primary">{t('home.seeAll')} →</button>
          </div>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <VendorCardSkeleton key={i} />)
              : vendors.length > 0
                ? vendors.map((v) => (
                    <VendorCard
                      key={v.id}
                      id={v.id}
                      name={v.shop_name}
                      category={v.categories?.name_en}
                      products={v.product_count}
                      avatarUrl={v.shop_avatar_url}
                      verified={v.verification_status === 'approved'}
                    />
                  ))
                : <p className="px-1 text-[13px] text-muted-foreground">{t('home.noVendors')}</p>
            }
          </div>
        </section>

        {/* Trending products */}
        <section className="pt-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-syne text-[14px] font-bold text-foreground">{t('home.trending')}</h3>
            <Link href="/search" className="text-[12px] text-primary">{t('home.seeAll')} →</Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 px-4">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : displayed.length > 0
                ? displayed.map((p) => <ProductCard key={p.id} product={p} />)
                : (
                  <div className="col-span-2 py-10 text-center">
                    <p className="text-[13px] text-muted-foreground">
                      {activeCategory === 'All' ? t('home.noProducts') : t('home.noProductsCategory')}
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