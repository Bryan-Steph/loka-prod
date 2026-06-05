import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function VerifiedBadge({
  size = 'md',
  label = false,
  className,
}: {
  size?: 'sm' | 'md' | 'lg'
  label?: boolean
  className?: string
}) {
  const px = size === 'sm' ? 12 : size === 'lg' ? 18 : 14

  if (label) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full bg-success/20 px-1.5 py-0.5 font-mono text-[8px] font-medium tracking-wider text-success',
          className,
        )}
      >
        <CheckCircle2 size={9} />
        VERIFIED
      </span>
    )
  }

  return (
    <CheckCircle2
      size={px}
      className={cn('text-success', className)}
      aria-label="Verified vendor"
    />
  )
}
