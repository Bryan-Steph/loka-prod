import Link from 'next/link'
import { MapPin, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatXAF } from '@/lib/data'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

export interface ApiProductVendor {
  id: string
  shop_name: string
  shop_avatar_url?: string | null
  verification_status?: string | null
  address_text?: string | null
}

export interface ApiProduct {
  id: string
  name_en: string
  price: number
  condition?: 'new' | 'used' | 'refurbished' | string | null
  bargaining_allowed?: boolean | null
  stock_status?: string | null
  photo_urls?: string[] | null
  vendors?: ApiProductVendor | null
  categories?: { id: string; name_en: string } | null
  name_fr?: string | null
}

const CONDITION_LABEL: Record<string, string> = {
  new: 'New',
  used: 'Used',
  refurbished: 'Refurbished',
}

function Tag({ children, tone }: { children: React.ReactNode; tone: 'primary' | 'muted' }) {
  const styles = tone === 'primary'
    ? 'bg-primary/15 border-primary/40 text-primary'
    : 'bg-surface-2 border-surface-3 text-muted-foreground'
  return (
    <span className={cn('inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wider', styles)}>
      {children}
    </span>
  )
}

function ProductImage({ photoUrls, name, className }: { photoUrls?: string[] | null; name: string; className?: string }) {
  const src = photoUrls?.[0]
  return (
    <div className={cn('relative overflow-hidden bg-surface-2', className)}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon size={28} className="text-muted-foreground/50" />
        </div>
      )}
    </div>
  )
}

export function ProductCard({ product }: { product: ApiProduct }) {
  const condition = product.condition ? (CONDITION_LABEL[product.condition] ?? product.condition) : null
  const { lang } = useLanguage()
  const displayName = lang === 'fr' && product.name_fr ? product.name_fr : product.name_en

  return (
    <Link
      href={`/products/${product.id}`}
      className="block overflow-hidden rounded-2xl border border-surface-3 bg-surface-1 transition-colors hover:border-primary/50"
    >
      <ProductImage photoUrls={product.photo_urls} name={product.name_en} className="h-[100px] w-full" />
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-[2rem] text-[12px] font-semibold text-foreground">
          {product.name_en}
        </h3>
        <p className="mt-1.5 font-mono text-[13px] text-primary">
          {formatXAF(product.price)}
        </p>
        {(product.bargaining_allowed || condition) && (
          <div className="mt-1.5 flex items-center gap-1.5">
            {product.bargaining_allowed && <Tag tone="primary">BARGAIN OK</Tag>}
            {condition && <Tag tone="muted">{condition}</Tag>}
          </div>
        )}
        {product.vendors?.shop_name && (
          <p className="mt-1 truncate text-[10px] text-muted-foreground">
            {product.vendors.shop_name}
          </p>
        )}
      </div>
    </Link>
  )
}

export function ProductListCard({ product }: { product: ApiProduct }) {
  const condition = product.condition ? (CONDITION_LABEL[product.condition] ?? product.condition) : null

  return (
    <Link
      href={`/products/${product.id}`}
      className="flex gap-3 rounded-2xl border border-surface-3 bg-surface-1 p-3.5 transition-colors hover:border-primary/50"
    >
      <ProductImage photoUrls={product.photo_urls} name={product.name_en} className="h-20 w-20 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-[13px] font-semibold text-foreground">
          {product.name_en}
        </h3>
        {product.vendors?.shop_name && (
          <p className="mt-1 truncate text-[11px] text-muted-foreground">
            {product.vendors.shop_name}
          </p>
        )}
        {product.vendors?.address_text && (
          <div className="mt-1 flex items-center gap-1 text-muted-foreground">
            <MapPin size={10} />
            <span className="truncate font-mono text-[10px]">{product.vendors.address_text}</span>
          </div>
        )}
        <p className="mt-1.5 font-mono text-[15px] text-primary">
          {formatXAF(product.price)}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {product.bargaining_allowed && <Tag tone="primary">BARGAIN OK</Tag>}
          {condition && <Tag tone="muted">{condition}</Tag>}
        </div>
      </div>
    </Link>
  )
}