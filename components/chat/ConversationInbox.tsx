'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Store, User } from 'lucide-react'
import { formatXAF } from '@/lib/data'
import { SpinnerBlock } from '@/components/ui/Spinner'
import { VerifiedBadge } from '@/components/ui/verified-badge'

export interface ConversationListItem {
  id: string
  buyer_id: string
  vendor_id: string
  product_id: string
  last_message_at: string
  products: { id: string; name_en: string; price: number; photo_urls: string[] | null } | null
  vendors: { id: string; shop_name: string; shop_avatar_url: string | null; verification_status: string } | null
  buyer: { full_name: string | null; avatar_url: string | null } | null
  unread_count: number
  last_message: { content: string; created_at: string } | null
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function ConversationInbox() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [role, setRole] = useState<'buyer' | 'vendor'>('buyer')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  fetch('/api/conversations')
  .then(r => {
    if (r.status === 401) return null  // not logged in — show empty state
    return r.json()
  })
  .then(d => {
    if (!d) return
    if (d.conversations) setConversations(d.conversations)
    if (d.role) setRole(d.role)
  })
  .catch(console.error)
  .finally(() => setLoading(false))
  }, [])

  if (loading) return <SpinnerBlock label="Loading conversations…" />

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <MessageSquare size={48} className="text-muted-foreground" />
        <p className="font-syne text-[16px] font-bold text-foreground">No conversations yet</p>
        <p className="text-[13px] text-muted-foreground">
          {role === 'vendor'
            ? 'Buyers will appear here once they start bargaining on your products.'
            : 'Tap "Bargain" on any product to start a conversation with the vendor.'}
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-surface-3">
      {conversations.map((c) => {
        const otherName = role === 'vendor' ? (c.buyer?.full_name ?? 'Buyer') : (c.vendors?.shop_name ?? 'Vendor')
        const avatar = role === 'vendor' ? c.buyer?.avatar_url : c.vendors?.shop_avatar_url
        return (
          <Link
            key={c.id}
            href={`/chat/${c.id}`}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-1"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface-2">
              {avatar ? (
                <img src={avatar} alt={otherName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  {role === 'vendor' ? <User size={20} /> : <Store size={20} />}
                </div>
              )}
              {role === 'buyer' && c.vendors?.verification_status === 'approved' && (
                <VerifiedBadge size="sm" className="absolute -bottom-0.5 -right-0.5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[14px] font-semibold text-foreground">{otherName}</p>
                {c.last_message && (
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {timeAgo(c.last_message.created_at)}
                  </span>
                )}
              </div>
              {c.products && (
                <p className="truncate text-[11px] text-primary">
                  {c.products.name_en} · {formatXAF(c.products.price)}
                </p>
              )}
              {c.last_message && (
                <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  {c.last_message.content}
                </p>
              )}
            </div>

            {c.unread_count > 0 && (
              <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 font-mono text-[10px] font-bold text-primary-foreground">
                {c.unread_count}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}