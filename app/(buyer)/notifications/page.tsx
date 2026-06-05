'use client'

import { useEffect, useState } from 'react'
import {
  MessageSquare,
  Package,
  TrendingDown,
  Clock,
  CheckCircle2,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/buyer/BottomNav'
import {
  NotificationItem,
  type NotifTone,
} from '@/components/ui/NotificationItem'
import type { LucideIcon } from 'lucide-react'

const TABS = ['All', 'Bargains', 'Products', 'Payments'] as const
type TabId = (typeof TABS)[number]

type Notif = {
  icon: LucideIcon
  tone: NotifTone
  title: string
  description: string
  time: string
  unread?: boolean
  actionTag?: string
  group: 'TODAY' | 'YESTERDAY' | 'THIS WEEK'
  type: 'Bargains' | 'Products' | 'Payments'
}

const NOTIFS: Notif[] = [
  {
    icon: MessageSquare,
    tone: 'amber',
    title: 'Bargain Accepted — 40,500 XAF',
    description:
      'Mama Agnes accepted your offer for Samsung Galaxy A32. Tap to pay.',
    time: '5m ago',
    unread: true,
    actionTag: 'Pay Now',
    group: 'TODAY',
    type: 'Bargains',
  },
  {
    icon: Package,
    tone: 'blue',
    title: 'New from Tech Corner',
    description:
      'Tech Corner just added: Wireless Earbuds (20,000 XAF). You follow this vendor.',
    time: '2h ago',
    unread: true,
    group: 'TODAY',
    type: 'Products',
  },
  {
    icon: TrendingDown,
    tone: 'amber',
    title: 'Price Drop Alert',
    description:
      "Samsung Galaxy A32 dropped from 48,000 to 45,000 XAF. It's in your wishlist.",
    time: '4h ago',
    group: 'TODAY',
    type: 'Products',
  },
  {
    icon: Clock,
    tone: 'amber',
    title: 'Pickup Code Expiring Soon',
    description:
      'Your pickup code for JBL-style Speaker expires in 6 hours. Visit Shed 7, Up Station.',
    time: '1d ago',
    unread: true,
    group: 'YESTERDAY',
    type: 'Payments',
  },
  {
    icon: CheckCircle2,
    tone: 'success',
    title: 'Payment Confirmed',
    description:
      'Your payment of 12,000 XAF for JBL-style Speaker was received. Pickup code: ••••••',
    time: '1d ago',
    group: 'YESTERDAY',
    type: 'Payments',
  },
  {
    icon: MessageSquare,
    tone: 'amber',
    title: 'Counter Offer from Power Up Store',
    description:
      'Power Up Store countered your offer: 7,500 XAF for Power Bank 20,000mAh.',
    time: '1d ago',
    group: 'YESTERDAY',
    type: 'Bargains',
  },
  {
    icon: Package,
    tone: 'blue',
    title: 'New from Fabrics Palace',
    description: 'Fabrics Palace added 3 new products in Fashion.',
    time: '1d ago',
    group: 'YESTERDAY',
    type: 'Products',
  },
  {
    icon: CheckCircle2,
    tone: 'success',
    title: 'Pickup Confirmed',
    description:
      'Your pickup of JBL-style Speaker from Tech Corner (Shed 7) was confirmed. Transaction complete.',
    time: '3d ago',
    group: 'THIS WEEK',
    type: 'Payments',
  },
  {
    icon: TrendingDown,
    tone: 'amber',
    title: 'Price Drop Alert',
    description: "iPhone 13 Case dropped to 1,800 XAF. It's in your wishlist.",
    time: '4d ago',
    group: 'THIS WEEK',
    type: 'Products',
  },
  {
    icon: Package,
    tone: 'blue',
    title: 'New from Mama Agnes Electronics',
    description: 'Mama Agnes added: Tecno Camon 30 Pro. Be the first to bargain.',
    time: '5d ago',
    group: 'THIS WEEK',
    type: 'Products',
  },
]

const GROUPS: Notif['group'][] = ['TODAY', 'YESTERDAY', 'THIS WEEK']

function NotifSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3.5">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-surface-2" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-3/5 animate-pulse rounded bg-surface-2" />
        <div className="h-2.5 w-4/5 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<TabId>('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  const filtered = NOTIFS.filter((n) => tab === 'All' || n.type === tab)
  const isEmpty = !loading && filtered.length === 0

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-background pb-20">
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-surface-1">
        <div className="flex items-center justify-between px-4 py-3.5">
          <h1 className="font-heading text-xl text-foreground">Notifications</h1>
          <button className="text-xs text-primary">Mark all read</button>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          {TABS.map((t) => {
            const active = t === tab
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] transition-colors',
                  active
                    ? 'border border-primary bg-primary/15 text-primary'
                    : 'bg-surface-2 text-muted-foreground',
                )}
              >
                {t}
              </button>
            )
          })}
        </div>
      </header>

      {loading ? (
        <div>
          {Array.from({ length: 6 }).map((_, i) => (
            <NotifSkeleton key={i} />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <Bell size={56} className="text-muted-foreground" />
          <p className="mt-4 font-heading text-base text-muted-foreground">
            No payment notifications yet
          </p>
          <p className="mt-1 max-w-[260px] text-[13px] text-muted-foreground">
            Your payment confirmations and receipts will appear here
          </p>
        </div>
      ) : (
        GROUPS.map((g) => {
          const groupItems = filtered.filter((n) => n.group === g)
          if (groupItems.length === 0) return null
          return (
            <div key={g}>
              <p className="sticky top-[97px] z-20 bg-surface-1 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-primary">
                {g}
              </p>
              {groupItems.map((n, i) => (
                <NotificationItem key={n.title + i} {...n} index={i} />
              ))}
            </div>
          )
        })
      )}

      <BottomNav active="notifications" />
    </div>
  )
}
