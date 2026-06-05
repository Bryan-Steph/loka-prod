import { User, CheckCircle2 } from 'lucide-react'

export function VendorCard({
  name,
  category,
  products,
}: {
  name: string
  category: string
  products: number
}) {
  return (
    <div className="w-[125px] shrink-0 rounded-2xl border border-surface-3 bg-surface-1 p-3 text-center">
      <div className="relative mx-auto h-[42px] w-[42px]">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
          <User size={20} />
        </div>
        <CheckCircle2
          size={14}
          className="absolute -bottom-0.5 -right-0.5 rounded-full bg-surface-1 text-success"
          aria-label="Verified"
        />
      </div>
      <p className="mt-2 truncate text-[11px] font-semibold text-foreground">{name}</p>
      <p className="truncate font-mono text-[9px] text-muted-foreground">{category}</p>
      <p className="font-mono text-[9px] text-muted-foreground">{products} products</p>
    </div>
  )
}
