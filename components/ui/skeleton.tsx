import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-surface-3/60', className)}
      aria-hidden="true"
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-3 bg-surface-1">
      <Skeleton className="h-[100px] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}

export function VendorCardSkeleton() {
  return (
    <div className="w-[125px] shrink-0 rounded-2xl border border-surface-3 bg-surface-1 p-3">
      <Skeleton className="mx-auto h-[42px] w-[42px] rounded-full" />
      <Skeleton className="mx-auto mt-3 h-3 w-4/5" />
      <Skeleton className="mx-auto mt-2 h-2 w-1/2" />
    </div>
  )
}
