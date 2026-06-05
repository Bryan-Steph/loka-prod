'use client'

import Link from 'next/link'
import { Home, Search, MessageSquare, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'home' | 'search' | 'chat' | 'notifications' | 'profile'

const TABS: { key: Tab; label: string; icon: typeof Home; href: string }[] = [
  { key: 'home', label: 'Home', icon: Home, href: '/' },
  { key: 'search', label: 'Search', icon: Search, href: '/search' },
  { key: 'chat', label: 'Chat', icon: MessageSquare, href: '/chat/1' },
  { key: 'notifications', label: 'Alerts', icon: Bell, href: '/' },
  { key: 'profile', label: 'Profile', icon: User, href: '/' },
]

export function BottomNav({ active }: { active: Tab }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-16 max-w-[1200px] items-stretch border-t border-surface-3 bg-surface-1"
      aria-label="Primary"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = tab.key === active
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
            <span className="font-mono text-[9px]">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
