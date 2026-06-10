import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NotifTone = 'amber' | 'blue' | 'success' | 'error'

const TONE: Record<NotifTone, { bg: string; fg: string }> = {
  amber: { bg: 'bg-primary/15', fg: 'text-primary' },
  blue: { bg: 'bg-[#60A5FA]/15', fg: 'text-[#60A5FA]' },
  success: { bg: 'bg-success/15', fg: 'text-success' },
  error: { bg: 'bg-error/15', fg: 'text-error' },
}

export function NotificationItem({
  icon: Icon,
  tone,
  title,
  description,
  time,
  unread = false,
  actionTag,
  index = 0,
}: {
  icon: LucideIcon
  tone: NotifTone
  title: string
  description: string
  time: string
  unread?: boolean
  actionTag?: string
  index?: number
}) {
  const t = TONE[tone]
  return (
    <div
      className={cn(
        'flex animate-Shopsy-fade-in gap-3 px-4 py-3.5',
        unread
          ? 'border-l-[3px] border-primary bg-primary/[0.04]'
          : 'border-b border-surface-3',
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          t.bg,
        )}
      >
        <Icon size={18} className={t.fg} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[13px] text-foreground',
            unread ? 'font-semibold' : 'font-normal',
          )}
        >
          {title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          {time}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {unread && !actionTag ? (
          <span className="h-2 w-2 rounded-full bg-primary" />
        ) : null}
        {actionTag ? (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[9px] uppercase text-primary">
            {actionTag}
          </span>
        ) : null}
      </div>
    </div>
  )
}
