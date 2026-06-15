import Link from 'next/link'
import { Store } from 'lucide-react'
import { VerifiedBadge } from '@/components/ui/verified-badge'

export function VendorCard({
  id,
  name,
  category,
  products,
  avatarUrl,
  verified,
}: {
  id: string
  name: string
  category?: string | null
  products: number
  avatarUrl?: string | null
  verified?: boolean
}) {
  return (
    <Link
      href={`/vendors/${id}`}
      className="block w-[125px] shrink-0 rounded-2xl border border-surface-3 bg-surface-1 p-3 text-center transition-colors hover:border-primary/50"
    >
      <div className="relative mx-auto h-[42px] w-[42px]">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
            <Store size={20} />
          </div>
        )}
        {verified && (
          <VerifiedBadge size="sm" className="absolute -bottom-0.5 -right-0.5 rounded-full bg-surface-1" />
        )}
      </div>
      <p className="mt-2 truncate text-[11px] font-semibold text-foreground">{name}</p>
      {category && <p className="truncate font-mono text-[9px] text-muted-foreground">{category}</p>}
      <p className="font-mono text-[9px] text-muted-foreground">
        {products} product{products !== 1 ? 's' : ''}
      </p>
    </Link>
  )
}