import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PickupStatus = 'PICKED UP' | 'PENDING PICKUP' | 'CANCELLED'

const STATUS_STYLE: Record<PickupStatus, string> = {
  'PICKED UP': 'text-success',
  'PENDING PICKUP': 'text-primary',
  CANCELLED: 'text-error',
}

export function ActivityItem({
  product,
  vendor,
  date,
  amount,
  status,
  last = false,
}: {
  product: string
  vendor: string
  date: string
  amount: string
  status: PickupStatus
  last?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        !last && 'border-b border-surface-3',
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2">
        <ImageIcon size={16} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-foreground">{product}</p>
        <p className="truncate text-[11px] text-muted-foreground">{vendor}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{date}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="font-mono text-[13px] text-primary">{amount}</span>
        <span
          className={cn('font-mono text-[8px]', STATUS_STYLE[status])}
        >
          {status}
        </span>
      </div>
    </div>
  )
}
