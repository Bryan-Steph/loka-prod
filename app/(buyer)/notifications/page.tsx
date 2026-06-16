'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, CheckCircle2, DollarSign, AlertTriangle,
  ShieldCheck, XCircle, MessageSquare, Package,
  Clock, Loader2, Check,
} from 'lucide-react'
import { BottomNav } from '@/components/ui/bottom-nav'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  is_read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

type FilterTab = 'all' | 'bargains' | 'payments' | 'vendors'

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All',      value: 'all' },
  { label: 'Bargains', value: 'bargains' },
  { label: 'Payments', value: 'payments' },
  { label: 'Vendors',  value: 'vendors' },
]

function typeToFilter(type: string): FilterTab {
  if (/offer|bargain|counter|accepted/i.test(type)) return 'bargains'
  if (/payment|pickup|transaction|escrow|release|disburse/i.test(type)) return 'payments'
  if (/vendor|shop|verif|suspend|approved|rejected/i.test(type)) return 'vendors'
  return 'all'
}

function NotifIcon({ type }: { type: string }) {
  const base = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full'
  if (/approved/i.test(type))   return <div className={cn(base, 'bg-success/15')}><ShieldCheck size={18} className="text-success" /></div>
  if (/rejected|suspended/i.test(type)) return <div className={cn(base, 'bg-error/15')}><XCircle size={18} className="text-error" /></div>
  if (/dispute/i.test(type))    return <div className={cn(base, 'bg-error/15')}><AlertTriangle size={18} className="text-error" /></div>
  if (/payment|release|disburse/i.test(type)) return <div className={cn(base, 'bg-success/15')}><DollarSign size={18} className="text-success" /></div>
  if (/pickup/i.test(type))     return <div className={cn(base, 'bg-primary/15')}><CheckCircle2 size={18} className="text-primary" /></div>
  if (/offer|bargain|counter|accepted/i.test(type)) return <div className={cn(base, 'bg-primary/15')}><MessageSquare size={18} className="text-primary" /></div>
  if (/product|stock/i.test(type)) return <div className={cn(base, 'bg-surface-3')}><Package size={18} className="text-muted-foreground" /></div>
  if (/expir/i.test(type))      return <div className={cn(base, 'bg-primary/15')}><Clock size={18} className="text-primary" /></div>
  return <div className={cn(base, 'bg-surface-2')}><Bell size={18} className="text-muted-foreground" /></div>
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function dayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'TODAY'
  if (d.toDateString() === yesterday.toDateString()) return 'YESTERDAY'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

function getActionBadge(notif: Notification): { label: string; href: string } | null {
  const d = notif.data ?? {}
  if (/payment_confirmed|pickup_confirmed/.test(notif.type) && d.transaction_id) {
    return { label: 'VIEW', href: `/transactions/${d.transaction_id}` }
  }
  if (/accepted/.test(notif.type) && d.conversation_id) {
    return { label: 'PAY NOW', href: `/chat/${d.conversation_id}` }
  }
  if (/offer|bargain|counter/.test(notif.type) && d.conversation_id) {
    return { label: 'VIEW', href: `/chat/${d.conversation_id}` }
  }
  return null
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<FilterTab>('all')
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/notifications')
      .then(r => {
        if (r.status === 401) { router.push('/login'); return null }
        return r.json()
      })
      .then(d => {
        if (!d) return
        setNotifications(d.notifications ?? [])
        setUnread(d.unread ?? 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  useEffect(() => { load() }, [load])

  const markAllRead = async () => {
    setMarkingAll(true)
    await fetch('/api/notifications', { method: 'PATCH' }).catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnread(0)
    setMarkingAll(false)
  }

  const displayed = tab === 'all'
    ? notifications
    : notifications.filter(n => typeToFilter(n.type) === tab)

  // Group by day
  const grouped: Record<string, Notification[]> = {}
  for (const n of displayed) {
    const key = dayLabel(n.created_at)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(n)
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <h1 className="font-syne text-[18px] font-bold text-foreground">
          Notifications {unread > 0 && <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 font-mono text-[11px] text-primary-foreground">{unread}</span>}
        </h1>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-[12px] text-primary disabled:opacity-60"
          >
            {markingAll ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Mark all read
          </button>
        )}
      </header>

      <div className="mx-auto w-full max-w-[640px]">
        {/* Category tabs */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b border-surface-3 px-4 pt-3 pb-0">
          {TABS.map(t => {
            const count = t.value === 'all' ? unread : notifications.filter(n => !n.is_read && typeToFilter(n.type) === t.value).length
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  'shrink-0 border-b-2 px-3 pb-2.5 text-[13px] font-medium transition-colors',
                  tab === t.value
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground',
                )}
              >
                {t.label}
                {count > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/15 px-1 py-0.5 font-mono text-[10px] text-primary">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
              <Bell size={28} className="text-muted-foreground" />
            </div>
            <p className="font-syne text-[16px] font-bold text-foreground">No notifications</p>
            <p className="text-[13px] text-muted-foreground">
              Activity from your bargains and purchases will appear here.
            </p>
          </div>
        ) : (
          <div>
            {Object.entries(grouped).map(([day, items]) => (
              <div key={day}>
                <div className="px-4 py-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {day}
                  </p>
                </div>
                <div className="divide-y divide-surface-3">
                  {items.map(notif => {
                    const action = getActionBadge(notif)
                    return (
                      <div
                        key={notif.id}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3.5 transition-colors',
                          !notif.is_read ? 'bg-primary/5' : 'bg-background',
                        )}
                      >
                        <NotifIcon type={notif.type} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn('text-[13px] font-semibold leading-tight', !notif.is_read ? 'text-foreground' : 'text-muted-foreground')}>
                              {notif.title}
                            </p>
                            {action && (
                              <button
                                onClick={() => router.push(action.href)}
                                className="shrink-0 rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-bold text-primary-foreground"
                              >
                                {action.label}
                              </button>
                            )}
                          </div>
                          <p className="mt-0.5 text-[12px] text-muted-foreground">{notif.body}</p>
                          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                            {timeAgo(notif.created_at)}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="notifications" />
    </div>
  )
}