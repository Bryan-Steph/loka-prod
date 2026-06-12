'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus, Package, MoreVertical, Eye, EyeOff,
  Trash2, Pencil, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VendorShell } from '@/components/vendor/VendorShell'

interface Product {
  id: string
  name_en: string
  price: number
  condition: 'new' | 'used_good' | 'refurbished'
  is_active: boolean
  is_in_stock: boolean
  photo_urls: string[] | null
  bargaining_allowed: boolean
  created_at: string
category_id: string | null
}

const CONDITION_LABELS: Record<string, string> = {
  new:          'New',
  used_good:    'Used',
  refurbished:  'Refurbished',
}

const fmt = (n: number) => `XAF ${n.toLocaleString('en-US')}`

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [error, setError]       = useState('')

  useEffect(() => {
    fetch('/api/vendors/me/products')
      .then(r => r.json())
      .then(d => { if (d.products) setProducts(d.products) })
      .finally(() => setLoading(false))
  }, [])

  const toggleActive = async (product: Product) => {
    const next = { ...product, is_active: !product.is_active }
    setProducts(p => p.map(x => x.id === product.id ? next : x))

    const res = await fetch(`/api/products/${product.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ is_active: !product.is_active }),
    })
    if (!res.ok) {
      setProducts(p => p.map(x => x.id === product.id ? product : x)) // revert
      setError('Failed to update status — check /api/products/[id] supports PATCH')
    }
  }

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    const prev = [...products]
    setProducts(p => p.filter(x => x.id !== id))

    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      setProducts(prev) // revert
      setError('Failed to delete — check /api/products/[id] supports DELETE')
    }
    setMenuOpen(null)
  }

  return (
    <VendorShell>
      <div className="mx-auto w-full max-w-[640px] pb-10">
        {/* Page header */}
        <div className="flex items-center justify-between px-4 pb-4 pt-5">
          <h1 className="font-syne text-[20px] font-bold text-foreground">My Products</h1>
          <Link
            href="/vendor/products/new"
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground"
          >
            <Plus size={15} />
            Add
          </Link>
        </div>

        {error && (
          <p className="mx-4 mb-4 rounded-xl border border-error bg-error/10 px-4 py-3 text-[12px] text-error">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-4 py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-surface-3 bg-surface-1">
              <Package size={28} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-syne text-[16px] font-bold text-foreground">No products yet</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                List your first product and start selling.
              </p>
            </div>
            <Link
              href="/vendor/products/new"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-[14px] font-semibold text-primary-foreground"
            >
              <Plus size={16} />
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="space-y-3 px-4">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                menuOpen={menuOpen === product.id}
                onMenuToggle={() => setMenuOpen(p => p === product.id ? null : product.id)}
                onMenuClose={() => setMenuOpen(null)}
                onToggle={() => toggleActive(product)}
                onDelete={() => deleteProduct(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </VendorShell>
  )
}

function ProductCard({
  product, menuOpen, onMenuToggle, onMenuClose, onToggle, onDelete,
}: {
  product: Product
  menuOpen: boolean
  onMenuToggle: () => void
  onMenuClose: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const thumb = product.photo_urls?.[0]
    ? product.photo_urls[0].replace('/upload/', '/upload/c_fill,h_80,w_80/')
    : null

  return (
    <div className="relative flex gap-3 rounded-2xl border border-surface-3 bg-surface-1 p-3">
      {/* Thumbnail */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-2">
        {thumb
          ? <img src={thumb} alt={product.name_en} className="h-full w-full object-cover" />
          : <div className="flex h-full w-full items-center justify-center"><Package size={20} className="text-muted-foreground" /></div>
        }
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-foreground">{product.name_en}</p>
        <p className="mt-0.5 font-mono text-[13px] font-bold text-primary">{fmt(product.price)}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className={cn(
            'rounded-full px-2 py-0.5 font-mono text-[10px]',
            product.is_active
              ? 'bg-success/15 text-success'
              : 'bg-surface-3 text-muted-foreground',
          )}>
            {product.is_active ? 'Active' : 'Inactive'}
          </span>
          <span className="rounded-full bg-surface-3 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {CONDITION_LABELS[product.condition] ?? product.condition}
          </span>
          {product.bargaining_allowed && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary">
              Bargain
            </span>
          )}
        </div>
      </div>

      {/* Action menu */}
      <div className="shrink-0">
        <button
          onClick={onMenuToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-2"
          aria-label="Actions"
        >
          <MoreVertical size={16} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={onMenuClose} />
            <div className="absolute right-3 top-10 z-20 w-44 overflow-hidden rounded-xl border border-surface-3 bg-surface-1 shadow-xl">
              <button
                onClick={() => { onToggle(); onMenuClose() }}
                className="flex h-11 w-full items-center gap-3 px-4 text-[13px] text-foreground hover:bg-surface-2"
              >
                {product.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                {product.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <Link
                href={`/vendor/products/${product.id}/edit`}
                onClick={onMenuClose}
                className="flex h-11 w-full items-center gap-3 px-4 text-[13px] text-foreground hover:bg-surface-2"
              >
                <Pencil size={15} />
                Edit
              </Link>
              <button
                onClick={onDelete}
                className="flex h-11 w-full items-center gap-3 px-4 text-[13px] text-error hover:bg-error/10"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}