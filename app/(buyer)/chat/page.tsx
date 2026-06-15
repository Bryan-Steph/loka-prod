'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Send, DollarSign, Store, User as UserIcon,
  CheckCircle2, XCircle, RefreshCw, ShoppingCart, X, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatXAF } from '@/lib/data'
import { createClient } from '@/lib/supabase/client'
import { VerifiedBadge } from '@/components/ui/verified-badge'
import { Spinner } from '@/components/ui/Spinner'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'offer' | 'system'
  offer_id: string | null
  is_read: boolean
  created_at: string
}

interface Offer {
  id: string
  conversation_id: string
  buyer_id: string
  vendor_id: string
  offered_price: number
  offered_by: string
  status: 'pending' | 'accepted' | 'countered' | 'declined' | 'expired'
  created_at: string
  updated_at: string
}

interface ConversationData {
  id: string
  product: { id: string; name_en: string; price: number; photo_urls: string[] | null; bargaining_allowed: boolean } | null
  vendor: { id: string; shop_name: string; shop_avatar_url: string | null; verification_status: string } | null
  buyer: { full_name: string | null; avatar_url: string | null } | null
}

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl bg-surface-2 px-3.5 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatThreadPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [conversation, setConversation] = useState<ConversationData | null>(null)
  const [messages, setMessages]   = useState<Message[]>([])
  const [offers, setOffers]       = useState<Offer[]>([])
  const [role, setRole]           = useState<'buyer' | 'vendor'>('buyer')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)
  const [text, setText]           = useState('')
  const [sending, setSending]     = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)
  const [offerSheet, setOfferSheet] = useState<{ mode: 'new' | 'counter'; offerId?: string } | null>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [offerSubmitting, setOfferSubmitting] = useState(false)
  const [offerError, setOfferError] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimeout = useRef<number | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/conversations/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.conversation) setConversation(d.conversation)
        if (d.messages) setMessages(d.messages)
        if (d.offers) setOffers(d.offers)
        if (d.role) setRole(d.role)
        if (d.currentUserId) setCurrentUserId(d.currentUserId)
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || !currentUserId) return
    const supabase = createClient()

    const channel = supabase
      .channel(`conversation-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, (payload) => {
        const msg = payload.new as Message
        setMessages((prev) => (prev.some(m => m.id === msg.id) ? prev : [...prev, msg]))
        if (msg.sender_id !== currentUserId) setOtherTyping(false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bargain_offers', filter: `conversation_id=eq.${id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOffers((prev) => [...prev, payload.new as Offer])
        } else if (payload.eventType === 'UPDATE') {
          setOffers((prev) => prev.map(o => o.id === (payload.new as Offer).id ? payload.new as Offer : o))
        }
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId !== currentUserId) {
          setOtherTyping(!!payload.typing)
          if (payload.typing) {
            window.setTimeout(() => setOtherTyping(false), 3000)
          }
        }
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, currentUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, otherTyping])

  const broadcastTyping = useCallback((isTyping: boolean) => {
    if (!currentUserId || !channelRef.current) return
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId, typing: isTyping },
    })
  }, [currentUserId])

  const handleTextChange = (value: string) => {
    setText(value)
    broadcastTyping(true)
    if (typingTimeout.current) window.clearTimeout(typingTimeout.current)
    typingTimeout.current = window.setTimeout(() => broadcastTyping(false), 1500)
  }

  const sendMessage = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    setText('')
    broadcastTyping(false)

    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      })
      const d = await res.json()
      if (res.ok && d.message) {
        setMessages((prev) => (prev.some(m => m.id === d.message.id) ? prev : [...prev, d.message]))
      }
    } finally {
      setSending(false)
    }
  }

  const openOfferSheet = (mode: 'new' | 'counter', offerId?: string, prefill?: number) => {
    setOfferSheet({ mode, offerId })
    setOfferPrice(prefill ? String(prefill) : '')
    setOfferError('')
  }

  const submitOffer = async () => {
    const price = parseInt(offerPrice.replace(/\D/g, ''), 10)
    if (!price || price <= 0) {
      setOfferError('Enter a valid amount in XAF')
      return
    }
    setOfferSubmitting(true)
    setOfferError('')

    try {
      if (offerSheet?.mode === 'new') {
        const res = await fetch(`/api/conversations/${id}/offers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offered_price: price }),
        })
        const d = await res.json()
        if (!res.ok) { setOfferError(d.error ?? 'Failed to send offer'); return }
        if (d.offer) setOffers((prev) => [...prev, d.offer])
        if (d.message) setMessages((prev) => [...prev, d.message])
      } else if (offerSheet?.mode === 'counter' && offerSheet.offerId) {
        const res = await fetch(`/api/conversations/${id}/offers/${offerSheet.offerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'counter', counter_price: price }),
        })
        const d = await res.json()
        if (!res.ok) { setOfferError(d.error ?? 'Failed to send counter-offer'); return }
      }
      setOfferSheet(null)
    } catch {
      setOfferError('Network error — try again')
    } finally {
      setOfferSubmitting(false)
    }
  }

  const respondToOffer = async (offerId: string, action: 'accept' | 'decline') => {
    await fetch(`/api/conversations/${id}/offers/${offerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size={28} />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-[14px] text-muted-foreground">Conversation not found.</p>
        <Link href="/chat" className="text-[13px] text-primary">← Back to messages</Link>
      </div>
    )
  }

  const otherName = role === 'vendor'
    ? (conversation.buyer?.full_name ?? 'Buyer')
    : (conversation.vendor?.shop_name ?? 'Vendor')
  const otherAvatar = role === 'vendor' ? conversation.buyer?.avatar_url : conversation.vendor?.shop_avatar_url

  const acceptedOffer = offers.find(o => o.status === 'accepted')
  const latestOffer = offers.length > 0 ? offers[offers.length - 1] : null

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button onClick={() => router.push('/chat')} className="flex h-9 w-9 items-center justify-center text-foreground" aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-2">
          {otherAvatar ? (
            <img src={otherAvatar} alt={otherName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              {role === 'vendor' ? <UserIcon size={16} /> : <Store size={16} />}
            </div>
          )}
          {role === 'buyer' && conversation.vendor?.verification_status === 'approved' && (
            <VerifiedBadge size="sm" className="absolute -bottom-0.5 -right-0.5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-foreground">{otherName}</p>
          {otherTyping && <p className="text-[11px] text-primary">typing…</p>}
        </div>
      </header>

      {conversation.product && (
        <Link
          href={`/products/${conversation.product.id}`}
          className="flex shrink-0 items-center gap-2.5 border-b border-surface-3 bg-surface-1 px-4 py-2"
        >
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-surface-2">
            {conversation.product.photo_urls?.[0] && (
              <img src={conversation.product.photo_urls[0]} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-foreground">{conversation.product.name_en}</p>
            <p className="font-mono text-[11px] text-primary">{formatXAF(conversation.product.price)}</p>
          </div>
          <span className="shrink-0 text-[11px] text-primary">View →</span>
        </Link>
      )}

      {acceptedOffer && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-success/30 bg-success/10 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-success" />
            <span className="text-[12px] text-success">
              Offer accepted: {formatXAF(acceptedOffer.offered_price)}
            </span>
          </div>
          {role === 'buyer' && conversation.product && (
            <Link
              href={`/pay/${conversation.product.id}?amount=${acceptedOffer.offered_price}`}
              className="flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 font-mono text-[11px] font-semibold text-background"
            >
              <ShoppingCart size={12} />
              Pay Now
            </Link>
          )}
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            offer={m.offer_id ? offers.find(o => o.id === m.offer_id) : undefined}
            isOwn={m.sender_id === currentUserId}
            currentUserId={currentUserId}
            onCounter={(offer) => openOfferSheet('counter', offer.id, offer.offered_price)}
            onRespond={respondToOffer}
          />
        ))}
        {otherTyping && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-surface-3 bg-surface-1 p-3">
        <div className="flex items-end gap-2">
          {conversation.product?.bargaining_allowed && !acceptedOffer && (
            <button
              onClick={() => openOfferSheet('new', undefined, latestOffer?.offered_price)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary text-primary"
              aria-label="Make an offer"
            >
              <DollarSign size={18} />
            </button>
          )}
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Type a message…"
            rows={1}
            className="h-11 flex-1 resize-none rounded-xl border border-surface-3 bg-surface-2 px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
            aria-label="Send"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>

      {offerSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div className="w-full max-w-[480px] rounded-t-2xl border-t border-surface-3 bg-surface-1 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-syne text-lg font-bold text-foreground">
                {offerSheet.mode === 'new' ? 'Make an Offer' : 'Counter Offer'}
              </h2>
              <button onClick={() => setOfferSheet(null)} aria-label="Close" className="text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            {conversation.product && (
              <p className="mb-2 text-[12px] text-muted-foreground">
                Listed price: {formatXAF(conversation.product.price)}
              </p>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-surface-3 bg-surface-2 px-3.5">
              <span className="font-mono text-[14px] text-muted-foreground">XAF</span>
              <input
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value.replace(/[^\d]/g, ''))}
                inputMode="numeric"
                placeholder="0"
                className="h-12 w-full bg-transparent font-mono text-[16px] text-foreground focus:outline-none"
              />
            </div>
            {offerError && <p className="mt-2 text-[12px] text-error">{offerError}</p>}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setOfferSheet(null)}
                className="h-12 flex-1 rounded-xl border border-surface-3 text-sm text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={submitOffer}
                disabled={offerSubmitting}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-syne text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {offerSubmitting ? <Loader2 size={16} className="animate-spin" /> : <DollarSign size={16} />}
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MessageBubble({
  message, offer, isOwn, currentUserId, onCounter, onRespond,
}: {
  message: Message
  offer?: Offer
  isOwn: boolean
  currentUserId: string | null
  onCounter: (offer: Offer) => void
  onRespond: (offerId: string, action: 'accept' | 'decline') => void
}) {
  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-surface-2 px-3 py-1 text-center font-mono text-[10px] text-muted-foreground">
          {message.content}
        </span>
      </div>
    )
  }

  if (message.message_type === 'offer' && offer) {
    const canRespond = offer.status === 'pending' && offer.offered_by !== currentUserId
    const statusLabel = {
      pending: 'Pending', accepted: 'Accepted', countered: 'Countered', declined: 'Declined', expired: 'Expired',
    }[offer.status]
    const statusTone = {
      pending: 'text-primary', accepted: 'text-success', countered: 'text-muted-foreground',
      declined: 'text-error', expired: 'text-muted-foreground',
    }[offer.status]

    return (
      <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
        <div className="w-[220px] rounded-2xl border border-primary/40 bg-primary/10 p-3.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wide text-primary">Offer</span>
            <span className={cn('font-mono text-[10px]', statusTone)}>{statusLabel}</span>
          </div>
          <p className="mt-1 font-mono text-[18px] font-bold text-foreground">
            {formatXAF(offer.offered_price)}
          </p>
          {canRespond && (
            <div className="mt-2 flex gap-1.5">
              <button
                onClick={() => onRespond(offer.id, 'accept')}
                className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg bg-success font-mono text-[10px] font-semibold text-background"
              >
                <CheckCircle2 size={12} /> Accept
              </button>
              <button
                onClick={() => onCounter(offer)}
                className="flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-surface-3 font-mono text-[10px] text-foreground"
              >
                <RefreshCw size={12} /> Counter
              </button>
              <button
                onClick={() => onRespond(offer.id, 'decline')}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-error/40 text-error"
                aria-label="Decline"
              >
                <XCircle size={12} />
              </button>
            </div>
          )}
          <p className="mt-1.5 text-right font-mono text-[9px] text-muted-foreground">
            {timeLabel(message.created_at)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[13px]',
        isOwn ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-foreground',
      )}>
        <p className="leading-relaxed">{message.content}</p>
        <p className={cn('mt-1 text-right font-mono text-[9px]', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
          {timeLabel(message.created_at)}
        </p>
      </div>
    </div>
  )
}