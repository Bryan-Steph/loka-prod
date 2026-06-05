import { cn } from '@/lib/utils'

type Status =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'VERIFIED'
  | 'COUNTER'

const STYLES: Record<Status, string> = {
  PENDING: 'bg-primary/15 text-primary',
  ACCEPTED: 'bg-success/15 text-success',
  DECLINED: 'bg-error/10 text-error',
  VERIFIED: 'bg-success/20 border border-success/40 text-success',
  COUNTER: 'bg-primary/15 text-primary',
}

export function StatusBadge({
  status,
  className,
}: {
  status: Status
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[9px] font-medium tracking-wider',
        STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
