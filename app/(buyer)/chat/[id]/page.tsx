'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  MoreVertical,
  CheckCircle2,
  Circle,
  User,
  Tag,
  ArrowLeftRight,
  X,
  Check,
  ShoppingCart,
  Camera,
  SendHorizontal,
  ImageIcon,
} from 'lucide-react'
import { BottomNav } from '@/components/buyer/BottomNav'

export default function ChatThreadPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-background pb-16">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-surface-1">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/chat" aria-label="Back" className="text-foreground">
            <ArrowLeft size={24} />
          </Link>
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2">
              <User size={18} className="text-muted-foreground" />
            </div>
            <CheckCircle2
              size={12}
              className="absolute -bottom-0.5 -right-0.5 rounded-full bg-surface-1 text-success"
            />
          </div>
          <div className="flex-1">
            <p className="font-heading text-[15px] text-foreground">
              Mama Agnes Electronics
            </p>
            <span className="flex items-center gap-1">
              <Circle size={8} className="fill-success text-success" />
              <span className="font-mono text-[10px] text-success">
                Active now
              </span>
            </span>
          </div>
          <button aria-label="More options" className="text-muted-foreground">
            <MoreVertical size={22} />
          </button>
        </div>

        {/* Product pin banner */}
        <div className="flex items-center gap-3 border-t border-surface-3 bg-surface-2 px-4 py-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-1">
            <ImageIcon size={20} className="text-muted-foreground" />
          </div>
          <p className="flex-1 text-[13px] text-foreground">
            Samsung Galaxy A32 (Unlocked)
          </p>
          <div className="text-right">
            <p className="font-mono text-[13px] text-primary">45,000 XAF</p>
            <p className="font-mono text-[8px] text-muted-foreground">Pinned</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex flex-1 flex-col gap-3 px-4 py-4">
        {/* Vendor msg 1 */}
        <div className="max-w-[75%] self-start">
          <div className="rounded-2xl rounded-bl-sm bg-surface-2 px-3.5 py-3 text-[13px] text-foreground">
            Hello! Yes the Samsung A32 is still available. Perfect screen, only
            minor back scratches.
          </div>
          <p className="mt-1 font-mono text-[9px] text-muted-foreground">
            10:20 AM
          </p>
        </div>

        {/* Buyer msg 2 */}
        <div className="max-w-[75%] self-end">
          <div className="rounded-2xl rounded-br-sm bg-primary px-3.5 py-3 text-[13px] text-primary-foreground">
            Is the battery health still good? Any issues with the camera?
          </div>
          <p className="mt-1 text-right font-mono text-[9px] text-muted-foreground">
            10:22 AM
          </p>
        </div>

        {/* Vendor msg 3 */}
        <div className="max-w-[75%] self-start">
          <div className="rounded-2xl rounded-bl-sm bg-surface-2 px-3.5 py-3 text-[13px] text-foreground">
            Battery is at 89% health. Camera works perfectly, both front and
            back. I can show you on video call.
          </div>
          <p className="mt-1 font-mono text-[9px] text-muted-foreground">
            10:23 AM
          </p>
        </div>

        {/* Bargain offer card */}
        <div className="rounded-2xl border-[1.5px] border-primary/70 bg-surface-1 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Tag size={14} className="text-primary" />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-primary">
                Bargain Offer
              </span>
            </div>
            <span className="font-mono text-[9px] text-muted-foreground">
              10:31 AM
            </span>
          </div>
          <p className="my-2 font-mono text-3xl text-primary">38,000 XAF</p>
          <p className="text-xs text-muted-foreground line-through opacity-70">
            Original price: 45,000 XAF
          </p>
          <span className="mt-2 inline-block rounded-full bg-success/10 px-2 py-0.5 font-mono text-[10px] text-success">
            Save 7,000 XAF
          </span>
          <p className="mt-2 text-xs italic text-muted-foreground">
            &quot;I&apos;m a GBHS student, please help me out&quot;
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
              <User size={10} />
              You sent this offer
            </span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[9px] text-primary">
              PENDING
            </span>
          </div>
        </div>

        {/* Counter offer card */}
        <div className="rounded-2xl border-[1.5px] border-primary bg-surface-1 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ArrowLeftRight size={14} className="text-primary" />
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-primary">
                Counter Offer
              </span>
            </div>
            <span className="font-mono text-[9px] text-muted-foreground">
              10:45 AM
            </span>
          </div>
          <p className="my-2 font-mono text-3xl text-primary">40,500 XAF</p>
          <p className="text-xs text-muted-foreground">You offered: 38,000 XAF</p>
          <p className="mt-2 text-xs italic text-muted-foreground">
            &quot;Best I can do. Phone is in excellent condition.&quot;
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[9px] text-muted-foreground">
              Mama Agnes Electronics
            </span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[9px] text-primary">
              COUNTER
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-error text-sm text-error">
            <X size={16} />
            Decline
          </button>
          <button className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-surface-3 text-sm text-foreground">
            <ArrowLeftRight size={16} />
            Counter
          </button>
          <button className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary font-heading text-sm font-semibold text-primary-foreground">
            <Check size={16} />
            Accept
          </button>
        </div>

        {/* Accepted state banner */}
        <div className="flex items-center gap-2 rounded-xl border border-success bg-success/10 p-3">
          <CheckCircle2 size={16} className="text-success" />
          <span className="text-[13px] font-semibold text-success">
            Deal agreed — 40,500 XAF
          </span>
        </div>

        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-heading text-[15px] font-semibold text-primary-foreground">
          <ShoppingCart size={16} />
          Pay Now — 40,500 XAF
        </button>
      </main>

      {/* Input bar */}
      <div className="sticky bottom-16 z-30 flex items-center gap-2 border-t border-surface-3 bg-surface-1 p-3">
        <button aria-label="Camera" className="text-muted-foreground">
          <Camera size={24} />
        </button>
        <input
          placeholder="Message or make an offer..."
          className="h-11 flex-1 rounded-xl border border-surface-3 bg-surface-2 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button className="flex h-11 items-center gap-1 rounded-xl border border-primary bg-surface-2 px-2.5 text-primary">
          <Tag size={12} />
          <span className="font-mono text-[11px]">Offer</span>
        </button>
        <button
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
        >
          <SendHorizontal size={18} />
        </button>
      </div>

      <BottomNav active="chat" />
    </div>
  )
}
