'use client'

import Link from 'next/link'
import { Home, Search, MessageSquare, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'home' | 'search' | 'chat' | 'notifications' | 'profile'

const TABS: {
  id: Tab
  label: string
  icon: typeof Home
  href: string
  badge?: number
  dot?: boolean
}[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/feed' },
  { id: 'search', label: 'Search', icon: Search, href: '/feed' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, href: '/chat', badge: 2 },
  {
    id: 'notifications',
    label: 'Alerts',
    icon: Bell,
    href: '/notifications',
    dot: true,
  },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
]

export function BottomNav({ active }: { active: Tab }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-16 max-w-[480px] items-stretch border-t border-surface-3 bg-surface-1"
      aria-label="Primary"
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active
        const Icon = tab.icon
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex flex-1 flex-col items-center justify-center gap-1"
          >
            <span className="relative">
              <Icon
                size={22}
                className={cn(
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              />
              {tab.badge ? (
                <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-medium text-primary-foreground">
                  {tab.badge}
                </span>
              ) : null}
              {tab.dot ? (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
              ) : null}
            </span>
            <span
              className={cn(
                'font-mono text-[9px]',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
