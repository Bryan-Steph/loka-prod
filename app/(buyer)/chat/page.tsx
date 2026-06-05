'use client'

import { useEffect, useState } from 'react'
import { Search, ArchiveX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/buyer/BottomNav'
import {
  ConversationItem,
  type BargainStatus,
} from '@/components/buyer/ConversationItem'

const TABS = ['All', 'Active Bargains', 'Completed', 'Archived'] as const
type TabId = (typeof TABS)[number]

type Convo = {
  id: string
  shop: string
  verified?: boolean
  product: string
  lastMessage: string
  time: string
  unread?: number
  status?: BargainStatus
}

const CONVERSATIONS: Convo[] = [
  {
    id: '1',
    shop: 'Mama Agnes Electronics',
    verified: true,
    product: 'Samsung Galaxy A32 (Unlocked)',
    lastMessage: "I can do 40,000 XAF, that's my final price.",
    time: '5m ago',
    unread: 2,
    status: 'COUNTER',
  },
  {
    id: '2',
    shop: 'Tech Corner',
    verified: true,
    product: 'JBL-style Speaker',
    lastMessage: "Yes it's available! When can you come?",
    time: '32m ago',
    unread: 1,
    status: null,
  },
  {
    id: '3',
    shop: 'Mobile Accessories Hub',
    product: 'iPhone 13 Case',
    lastMessage: 'Okay, deal! Pay when ready.',
    time: '2h ago',
    status: 'ACCEPTED',
  },
  {
    id: '4',
    shop: 'Power Up Store',
    product: 'Power Bank 20,000mAh',
    lastMessage: 'You: Can you go below 7,500 XAF?',
    time: '1d ago',
    status: 'PENDING',
  },
  {
    id: '5',
    shop: 'Bookworm Shop',
    product: 'Biology Textbook',
    lastMessage: 'You: Is the book in good condition?',
    time: '3d ago',
    status: null,
  },
]

function ConvoSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-surface-2" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/5 animate-pulse rounded bg-surface-2" />
        <div className="h-2.5 w-4/5 animate-pulse rounded bg-surface-2" />
      </div>
      <div className="h-2.5 w-8 animate-pulse rounded bg-surface-2" />
    </div>
  )
}

export default function ChatInboxPage() {
  const [tab, setTab] = useState<TabId>('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  const unreadCount = CONVERSATIONS.reduce((n, c) => n + (c.unread ?? 0), 0)

  const filtered = CONVERSATIONS.filter((c) => {
    if (tab === 'All') return true
    if (tab === 'Active Bargains')
      return c.status === 'PENDING' || c.status === 'COUNTER'
    if (tab === 'Completed') return c.status === 'ACCEPTED'
    return false // Archived: empty
  })

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-background pb-20">
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-surface-1">
        <div className="flex items-center justify-between px-4 py-3.5">
          <h1 className="font-heading text-xl text-foreground">Messages</h1>
          <span className="font-mono text-[11px] text-primary">
            {unreadCount} unread
          </span>
        </div>
      </header>

      <div className="px-4 py-3">
        <div className="flex h-11 items-center gap-2 rounded-xl border border-surface-3 bg-surface-2 px-3">
          <Search size={18} className="text-muted-foreground" />
          <input
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
        {TABS.map((t) => {
          const active = t === tab
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1.5 font-mono text-[10px] transition-colors',
                active
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-transparent bg-surface-2 text-muted-foreground',
              )}
            >
              {t}
            </button>
          )
        })}
      </div>

      <div className="divide-y divide-surface-3 border-t border-surface-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <ConvoSkeleton key={i} />)
        ) : tab === 'Archived' || filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <ArchiveX size={48} className="text-muted-foreground" />
            <p className="mt-4 font-heading text-base text-muted-foreground">
              No archived conversations
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Conversations appear here after you archive them
            </p>
          </div>
        ) : (
          filtered.map((c) => <ConversationItem key={c.id} {...c} />)
        )}
      </div>

      <BottomNav active="chat" />
    </div>
  )
}
