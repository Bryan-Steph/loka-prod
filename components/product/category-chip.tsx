'use client'

import { cn } from '@/lib/utils'

export function CategoryChip({
  label,
  active = false,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors',
        active
          ? 'border-primary bg-primary/20 text-primary'
          : 'border-surface-3 bg-surface-1 text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}
