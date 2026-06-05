import Link from 'next/link'
import { CheckCircle2, Tag, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export type BargainStatus = 'PENDING' | 'ACCEPTED' | 'COUNTER' | null

export function ConversationItem({
  id,
  shop,
  verified,
  product,
  lastMessage,
  time,
  unread = 0,
  status,
}: {
  id: string
  shop: string
  verified?: boolean
  product: string
  lastMessage: string
  time: string
  unread?: number
  status?: BargainStatus
}) {
  const statusColor =
    status === 'ACCEPTED'
      ? 'bg-success/15 text-success'
      : 'bg-primary/15 text-primary'

  return (
    <Link
      href={`/chat/${id}`}
      className={cn(
        'relative flex items-center gap-3 px-4 py-3 transition-colors active:bg-surface-2',
        unread > 0 ? 'bg-surface-1' : 'bg-transparent',
      )}
    >
      {unread > 0 ? (
        <span className="absolute inset-y-0 left-0 w-[3px] bg-primary" />
      ) : null}

      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2">
          <User size={20} className="text-muted-foreground" />
        </div>
        {verified ? (
          <CheckCircle2
            size={14}
            className="absolute -bottom-0.5 -right-0.5 rounded-full bg-surface-1 text-success"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {shop}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
            {time}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Tag size={10} className="shrink-0 text-primary" />
          <span className="truncate font-mono text-[10px] text-primary">
            {product}
          </span>
        </div>
        <p
          className={cn(
            'truncate text-xs',
            unread > 0
              ? 'font-medium text-foreground'
              : 'text-muted-foreground',
          )}
        >
          {lastMessage}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {unread > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] text-primary-foreground">
            {unread}
          </span>
        ) : null}
        {status ? (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-mono text-[8px]',
              statusColor,
            )}
          >
            {status}
          </span>
        ) : null}
      </div>
    </Link>
  )
}
