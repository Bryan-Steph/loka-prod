'use client'

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { BottomNav } from '@/components/ui/bottom-nav'

export default function ChatPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background pb-20">
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-surface-1 px-4">
        <div className="flex h-14 items-center justify-between">
          <h1 className="font-syne text-[20px] font-bold text-foreground">Messages</h1>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-2">
          <MessageSquare size={36} className="text-muted-foreground" />
        </div>
        <h2 className="mt-5 font-syne text-[20px] font-bold text-foreground">
          No conversations yet
        </h2>
        <p className="mt-2 max-w-[260px] text-[13px] leading-relaxed text-muted-foreground">
          When you tap "Bargain" on a product, your conversation with the vendor appears here
        </p>
        <Link
          href="/"
          className="mt-6 flex h-12 items-center justify-center rounded-xl bg-primary px-8 font-syne text-[14px] font-semibold text-primary-foreground"
        >
          Browse Products
        </Link>
      </div>

      <BottomNav active="chat" />
    </div>
  )
}