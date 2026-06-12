import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cn('animate-spin text-primary', className)} />
}

/** Drop into any empty-state area while data is loading. */
export function SpinnerBlock({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10">
      <Loader2 size={28} className="animate-spin text-primary" />
      {label && <p className="text-[12px] text-muted-foreground">{label}</p>}
    </div>
  )
}