'use client'

import { ImageIcon, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Product = {
  name: string
  price: string
  vendor: string
  shed?: string
  verified?: boolean
  bargainOk?: boolean
  isNew?: boolean
  addedAgo?: string
}

export function ProductCard({
  product,
  width,
  showHeart = false,
  onRemove,
}: {
  product: Product
  width?: number
  showHeart?: boolean
  onRemove?: () => void
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-surface-3 bg-surface-1"
      style={width ? { width } : undefined}
    >
      <div className="relative flex h-[100px] items-center justify-center bg-surface-2">
        <ImageIcon size={24} className="text-muted-foreground" />

        <div className="absolute left-1.5 top-1.5 flex gap-1">
          {product.isNew ? (
            <span className="rounded bg-success/20 px-1.5 py-0.5 font-mono text-[7px] text-success">
              NEW
            </span>
          ) : null}
          {product.bargainOk ? (
            <span className="rounded bg-primary/20 px-1.5 py-0.5 font-mono text-[7px] text-primary">
              BARGAIN OK
            </span>
          ) : null}
        </div>

        {product.verified ? (
          <span className="absolute right-1.5 top-1.5 rounded bg-success/20 px-1.5 py-0.5 font-mono text-[7px] text-success">
            VERIFIED
          </span>
        ) : null}

        {showHeart ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${product.name} from wishlist`}
            className="group absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface-1/80"
          >
            <Heart
              size={16}
              className="fill-primary text-primary group-active:fill-error group-active:text-error"
            />
          </button>
        ) : null}
      </div>

      <div className="p-3">
        <p
          className={cn(
            'line-clamp-2 text-xs font-semibold text-foreground',
          )}
        >
          {product.name}
        </p>
        <p className="mt-1 font-mono text-[13px] text-primary">
          {product.price}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
          {product.vendor}
          {product.shed ? ` · ${product.shed}` : ''}
        </p>
        {product.addedAgo ? (
          <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
            {product.addedAgo}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function ProductCardSkeleton({ width }: { width?: number }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-surface-3 bg-surface-1"
      style={width ? { width } : undefined}
    >
      <div className="h-[100px] animate-pulse bg-surface-2" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-surface-2" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  )
}
