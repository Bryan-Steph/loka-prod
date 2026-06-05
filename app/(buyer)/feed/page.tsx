'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Bell,
  User,
  Search,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/buyer/BottomNav'
import { ProductCard, type Product } from '@/components/buyer/ProductCard'

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Food & Drinks',
  'Fresh Produce',
  'Household',
  'Beauty',
  'Phones',
  'Books',
  'Shoes',
]

const FOLLOWED: Product[] = [
  {
    name: 'JBL-style Speaker (Bass Boost)',
    price: '12,000 XAF',
    vendor: 'Tech Corner',
    isNew: true,
    verified: true,
  },
  {
    name: 'Ankara Print Fabric (3 yards)',
    price: '4,500 XAF',
    vendor: 'Fabrics Palace',
    isNew: true,
  },
  {
    name: 'iPhone 13 Case (Shockproof)',
    price: '1,800 XAF',
    vendor: 'Mobile Accessories Hub',
    isNew: true,
    verified: true,
  },
  {
    name: 'Avocado 1 dozen (fresh)',
    price: '800 XAF',
    vendor: 'Green Market Hub',
    isNew: true,
  },
  {
    name: 'Nike-style Sneakers (Size 42)',
    price: '9,500 XAF',
    vendor: 'SportZone Bamenda',
    isNew: true,
  },
]

const FOR_YOU: Product[] = [
  {
    name: 'Samsung Galaxy A32 (Unlocked)',
    price: '45,000 XAF',
    vendor: 'Mama Agnes Electronics',
    shed: 'Shed 14A',
    verified: true,
    bargainOk: true,
  },
  {
    name: 'Bluetooth Earphones (Type-C)',
    price: '3,500 XAF',
    vendor: 'Tech Corner',
    shed: 'Shed 7',
    verified: true,
  },
  {
    name: 'School Uniform Fabric (white)',
    price: '2,800 XAF',
    vendor: 'Fabrics Palace',
    shed: 'Shed 3',
  },
  {
    name: 'Power Bank 20,000mAh',
    price: '8,000 XAF',
    vendor: 'Power Up Store',
    shed: 'Shed 8',
    bargainOk: true,
  },
  {
    name: 'Grilled Fish (large)',
    price: '1,500 XAF',
    vendor: 'Mama Blessing Foods',
    shed: 'Shed 2',
  },
  {
    name: 'Biology Textbook (GBHS)',
    price: '2,500 XAF',
    vendor: 'Bookworm Shop',
    shed: 'Shed 19',
  },
]

export default function FeedPage() {
  const [activeCat, setActiveCat] = useState('All')

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-background pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-surface-1">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-heading text-2xl font-extrabold text-primary">
            LOKA
          </span>
          <span className="flex items-center gap-1 rounded-full border border-surface-3 bg-surface-2 px-2.5 py-1">
            <MapPin size={11} className="text-primary" />
            <span className="font-mono text-[10px] text-primary">Bamenda</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="relative">
              <Bell size={22} className="text-foreground" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
            </Link>
            <Link
              href="/profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2"
            >
              <User size={16} className="text-muted-foreground" />
            </Link>
          </div>
        </div>
        <div className="px-4 pb-2 text-right font-mono text-[10px]">
          <span className="text-primary">EN</span>
          <span className="text-surface-3"> | </span>
          <span className="text-muted-foreground">FR</span>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="flex h-12 items-center gap-2 rounded-xl border border-surface-3 bg-surface-2 px-3">
          <Search size={18} className="text-muted-foreground" />
          <input
            placeholder="Search products, vendors..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1">
            <MapPin size={10} className="text-primary" />
            <span className="font-mono text-[10px] text-primary">Bamenda</span>
          </span>
        </div>
      </div>

      {/* Active bargains banner */}
      <Link
        href="/chat"
        className="mx-4 flex items-center gap-3 rounded-xl border-l-[3px] border-primary bg-primary/5 p-4"
      >
        <MessageSquare size={20} className="text-primary" />
        <div className="flex-1">
          <p className="font-heading text-sm text-foreground">
            2 Active Bargains
          </p>
          <p className="text-xs text-muted-foreground">
            Mama Agnes is waiting for your response
          </p>
        </div>
        <span className="text-xs text-primary">View →</span>
      </Link>

      {/* Category chips */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((cat) => {
          const active = cat === activeCat
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors',
                active
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-surface-3 bg-surface-1 text-muted-foreground',
              )}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* From Vendors You Follow */}
      <section className="mt-5">
        <div className="flex items-center justify-between px-4">
          <h2 className="font-heading text-sm text-foreground">
            From Vendors You Follow
          </h2>
          <button className="text-xs text-primary">See all →</button>
        </div>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
          {FOLLOWED.map((p) => (
            <div key={p.name} className="shrink-0">
              <ProductCard product={p} width={160} />
            </div>
          ))}
        </div>
      </section>

      {/* For You */}
      <section className="mt-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-1.5">
            <h2 className="font-heading text-sm text-foreground">For You</h2>
            <Sparkles size={14} className="text-primary" />
          </div>
          <button className="text-xs text-primary">See all →</button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 px-4">
          {FOR_YOU.map((p) => (
            <ProductCard key={p.name} product={p} />
          ))}
        </div>
      </section>

      <BottomNav active="home" />
    </div>
  )
}
