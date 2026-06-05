import { formatXAF } from '@/lib/data'
import { cn } from '@/lib/utils'

export function PriceDisplay({
  amount,
  className,
  strikethrough = false,
}: {
  amount: number
  className?: string
  strikethrough?: boolean
}) {
  return (
    <span
      className={cn(
        'font-mono text-primary',
        strikethrough && 'text-muted-foreground line-through opacity-60',
        className,
      )}
    >
      {formatXAF(amount)}
    </span>
  )
}
