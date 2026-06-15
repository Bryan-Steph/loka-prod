'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Package, Edit2, Trash2,
  Eye, BadgeCheck, XCircle, Loader2,
} from 'lucide-react'
import { formatXAF } from '@/lib/data'
import { cn } from '@/lib/utils'

interface VendorProduct {
  id: string
  name_en: string
  price: number
  stock_status: string
  is_published: boolean
  condition: string
  photo_urls: string[] | null
  view_count: number
  bargaining_allowed: boolean
  categories: { name_en: string } | null
  created_at: string
}

export default function VendorProductsPage() {
  const router = useRouter()
  const [products, setProducts]   = useState<VendorProduct[]>([])
  const [loading, setLoading]     = useState(true)
  const [deleting, setDeleting]   = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/vendors/me/products')
      .then((r) => r.json())
      .then((d) => { if (d.products) setProducts(d.products) })
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (productId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(productId)
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button
          onClick={() => router.push('/vendor/dashboard')}
          className="flex h-10 w-9 items-center justify-center text-foreground"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-syne text-[18px] font-bold text-foreground">My Products</h1>
        <Link
          href="/vendor/products/new"
          className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 font-mono text-[12px] font-semibold text-primary-foreground"
        >
          <Plus size={14} />
          Add
        </Link>
      </header>

      <div className="mx-auto w-full max-w-[640px] px-4 pt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Package size={48} className="text-muted-foreground" />
            <p className="font-syne text-[18px] font-bold text-foreground">No products yet</p>
            <p className="text-[13px] text-muted-foreground">
              Add your first product to start selling on LOKA
            </p>
            <Link
              href="/vendor/products/new"
              className="flex h-12 items-center gap-2 rounded-xl bg-primary px-6 font-syne text-[14px] font-semibold text-primary-foreground"
            >
              <Plus size={16} />
              Add Product
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-[11px] text-muted-foreground">
              {products.length} product{products.length !== 1 ? 's' : ''}
            </p>

            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-surface-3 bg-surface-1 p-3"
              >
                {/* Thumbnail */}
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                  {p.photo_urls?.[0] ? (
                    <img
                      src={p.photo_urls[0]}
                      alt={p.name_en}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package size={20} className="text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-foreground">{p.name_en}</p>
                  <p className="font-mono text-[12px] text-primary">{formatXAF(p.price)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {p.categories && (
                      <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[9px] text-muted-foreground">
                        {p.categories.name_en}
                      </span>
                    )}
                    <span className={cn(
                      'flex items-center gap-0.5 font-mono text-[9px]',
                      p.stock_status === 'in_stock' ? 'text-success' : 'text-error',
                    )}>
                      {p.stock_status === 'in_stock'
                        ? <><BadgeCheck size={9} /> In Stock</>
                        : <><XCircle size={9} /> Out of Stock</>
                      }
                    </span>
                    <span className="flex items-center gap-0.5 font-mono text-[9px] text-muted-foreground">
                      <Eye size={9} /> {p.view_count}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 flex-col gap-1.5">
                  <Link
                    href={`/vendor/products/${p.id}/edit`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-3 text-muted-foreground hover:border-primary hover:text-primary"
                    aria-label="Edit"
                  >
                    <Edit2 size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name_en)}
                    disabled={deleting === p.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-3 text-muted-foreground hover:border-error hover:text-error disabled:opacity-50"
                    aria-label="Delete"
                  >
                    {deleting === p.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}