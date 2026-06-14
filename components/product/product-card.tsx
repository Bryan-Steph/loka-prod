import Link from 'next/link'
import { Clock, MapPin } from 'lucide-react'
import type { Product } from '@/lib/data'
import { formatXAF } from '@/lib/data'
import { MapPlaceholder } from '@/components/ui/placeholders'
import { VerifiedBadge } from '@/components/ui/verified-badge'

function Tag({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'success' | 'primary' | 'muted'
}) {
  const styles =
    tone === 'success'
      ? 'bg-success/20 border-success/40 text-success'
      : tone === 'primary'
        ? 'bg-primary/15 border-primary/40 text-primary'
        : 'bg-surface-2 border-surface-3 text-muted-foreground'
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[7px] font-medium tracking-wider ${styles}`}
    >
      {children}
    </span>
  )
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block overflow-hidden rounded-2xl border border-surface-3 bg-surface-1 transition-colors hover:border-primary/50"
    >
      <div className="relative">
        <MapPlaceholder className="h-[100px] w-full" />
        {product.verified && (
          <div className="absolute right-2 top-2">
            <Tag tone="success">VERIFIED</Tag>
          </div>
        )}
        {product.bargainOk && (
          <div className="absolute left-2 top-2">
            <Tag tone="primary">BARGAIN OK</Tag>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[2rem] text-[12px] font-semibold text-foreground">
          {product.name}
        </h3>
        <p className="mt-1.5 font-mono text-[13px] text-primary">
          {formatXAF(product.price)}
        </p>
        <div className="mt-1 flex items-center gap-1">
          <span className="truncate text-[10px] text-muted-foreground">
            {product.vendor}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="shrink-0 font-mono text-[9px] text-muted-foreground">
            {product.shed}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function ProductListCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="flex gap-3 rounded-2xl border border-surface-3 bg-surface-1 p-3.5 transition-colors hover:border-primary/50"
    >
      <MapPlaceholder className="h-20 w-20 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-[13px] font-semibold text-foreground">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5">
          <div className="h-5 w-5 shrink-0 rounded-full bg-surface-2" />
          <span className="truncate text-[11px] text-muted-foreground">
            {product.vendor}
          </span>
          {product.verified && <VerifiedBadge size="sm" />}
        </div>
        {product.address && (
          <div className="mt-1 flex items-center gap-1 text-muted-foreground">
            <MapPin size={10} />
            <span className="truncate font-mono text-[10px]">{product.address}</span>
          </div>
        )}
        <p className="mt-1.5 font-mono text-[15px] text-primary">
          {formatXAF(product.price)}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {product.bargainOk && <Tag tone="primary">BARGAIN OK</Tag>}
          {product.condition && <Tag tone="muted">{product.condition}</Tag>}
          {product.lastActive && (
            <span className="inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
              <Clock size={10} />
              {product.lastActive}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
