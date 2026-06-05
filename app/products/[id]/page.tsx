'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Share2,
  Heart,
  ImageIcon,
  MessageSquare,
  Package,
  User,
  MapPin,
  Clock,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react'
import { MapPlaceholder } from '@/components/ui/placeholders'
import { VerifiedBadge } from '@/components/ui/verified-badge'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <Link
          href="/search"
          className="flex h-10 w-9 items-center justify-center text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-syne text-[16px] font-bold text-foreground">
          Product Details
        </h1>
        <div className="flex items-center gap-1">
          <button
            className="flex h-10 w-9 items-center justify-center text-muted-foreground"
            aria-label="Share"
          >
            <Share2 size={20} />
          </button>
          <button
            className="flex h-10 w-9 items-center justify-center text-muted-foreground"
            aria-label="Save"
          >
            <Heart size={20} />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[640px]">
        {/* Images */}
        <div className="relative flex h-[240px] items-center justify-center bg-surface-2 text-muted-foreground">
          <ImageIcon size={32} />
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full',
                  i === 0 ? 'bg-primary' : 'bg-surface-3',
                )}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            5 photos
          </span>
        </div>

        {/* Info */}
        <div className="px-4 pt-2">
          <h2 className="font-syne text-[20px] font-bold text-foreground">
            Samsung Galaxy A32 (Unlocked)
          </h2>
          <div className="mt-2 flex items-center gap-2.5">
            <span className="font-mono text-[24px] text-primary">45,000 XAF</span>
            <span className="rounded-full border border-surface-3 bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              Used
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/15 px-2.5 py-1 font-mono text-[11px] text-success">
              <MessageSquare size={12} />
              Bargaining Open
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-success">
              <Package size={12} />
              In Stock · 3 available
            </span>
          </div>
        </div>

        {/* Vendor card */}
        <div className="px-4 pt-5">
          <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
            <div className="flex items-start gap-3">
              <div className="relative h-11 w-11 shrink-0">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
                  <User size={20} />
                </div>
                <VerifiedBadge
                  size="sm"
                  className="absolute -bottom-0.5 -right-0.5 rounded-full bg-surface-1 text-primary"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-syne text-[15px] font-bold text-foreground">
                  Mama Agnes Electronics
                </h3>
                <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  <MapPin size={11} />
                  Shed 14A, Commercial Avenue, Bamenda
                </p>
                <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                  <Clock size={10} />
                  Active 1h ago
                </p>
              </div>
              <button className="shrink-0 text-[12px] text-primary">View Shop →</button>
            </div>
            <MapPlaceholder
              className="mt-3 h-[100px] w-full"
              label="Shed location map"
            />
          </div>
        </div>

        {/* Description */}
        <div className="px-4 pt-5">
          <h3 className="font-syne text-[14px] font-bold text-foreground">
            Description
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Clean Samsung Galaxy A32, fully unlocked and ready to use with any network
            in Cameroon. Screen is in perfect condition with only minor scratches on
            the back. Comes with charger. Battery health is excellent and bargaining is
            welcome.
          </p>
        </div>

        {/* Share */}
        <div className="px-4 pt-4">
          <button className="flex items-center gap-2 text-[12px] text-primary">
            <Share2 size={14} />
            Share via WhatsApp, SMS, Telegram
          </button>
        </div>
      </div>

      {/* Sticky bottom CTAs */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[1200px] items-center gap-2 border-t border-surface-3 bg-surface-1 p-4">
        <button className="flex flex-col items-center gap-0.5 px-1 text-[13px] text-muted-foreground">
          <AlertTriangle size={18} />
          <span className="text-[10px]">Report</span>
        </button>
        <Link
          href="/chat/1"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary py-3 text-[14px] font-semibold text-primary"
        >
          <MessageSquare size={16} />
          Bargain
        </Link>
        <Link
          href="/pay/1"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-[14px] font-semibold text-primary-foreground"
        >
          <ShoppingCart size={16} />
          Buy Now
        </Link>
      </div>
    </div>
  )
}
