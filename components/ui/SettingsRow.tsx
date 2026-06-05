'use client'

import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SettingsRow({
  icon: Icon,
  label,
  value,
  valueClassName,
  control,
  showChevron = true,
  danger = false,
  last = false,
  onClick,
}: {
  icon: LucideIcon
  label: string
  value?: string
  valueClassName?: string
  control?: React.ReactNode
  showChevron?: boolean
  danger?: boolean
  last?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-[52px] w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-surface-2',
        !last && 'border-b border-surface-3',
      )}
    >
      <Icon
        size={18}
        className={cn(danger ? 'text-error' : 'text-muted-foreground')}
      />
      <span
        className={cn(
          'flex-1 text-sm',
          danger ? 'text-error' : 'text-foreground',
        )}
      >
        {label}
      </span>
      {value ? (
        <span
          className={cn(
            'text-right text-xs text-muted-foreground',
            valueClassName,
          )}
        >
          {value}
        </span>
      ) : null}
      {control}
      {showChevron && !control ? (
        <ChevronRight size={18} className="text-muted-foreground" />
      ) : null}
    </button>
  )
}

export function Toggle({
  on,
  onChange,
}: {
  on: boolean
  onChange?: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={(e) => {
        e.stopPropagation()
        onChange?.(!on)
      }}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        on ? 'bg-primary' : 'bg-surface-3',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-all',
          on ? 'left-[22px] bg-primary-foreground' : 'left-0.5',
        )}
      />
    </button>
  )
}
