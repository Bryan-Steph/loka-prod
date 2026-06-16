'use client'

import Link from 'next/link'
import { Home, Search, MessageSquare, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/lib/routes'

type Tab = 'home' | 'search' | 'chat' | 'notifications' | 'profile'

export function BottomNav({ active }: { active: Tab }) {
  const user     = useAuthStore((s) => s.user)
  const isVendor = user?.role === 'vendor'

  const TABS: { id: Tab; label: string; icon: typeof Home; href: string }[] = [
    {
      id:    'home',
      label: 'Home',
      icon:  Home,
      href:  ROUTES.home,
    },
    {
      id:    'search',
      label: 'Search',
      icon:  Search,
      href:  ROUTES.search,
    },
    {
      id:    'chat',
      label: 'Chat',
      icon:  MessageSquare,
      href:  isVendor ? ROUTES.vendor.enquiries : ROUTES.buyer.chat,
    },
    {
      id:    'notifications',
      label: 'Alerts',
      icon:  Bell,
      href:  isVendor ? ROUTES.vendor.notifications : ROUTES.buyer.notifications,
    },
    {
      id:    'profile',
      label: 'Profile',
      icon:  User,
      href:  isVendor ? ROUTES.vendor.profile : ROUTES.buyer.profile,
    },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-16 max-w-[480px] items-stretch border-t border-surface-3 bg-surface-1"
      aria-label="Primary navigation"
    >
      {TABS.map((tab) => {
        const Icon     = tab.icon
        const isActive = tab.id === active
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {/* Icon + active dot container */}
            <div className="relative flex h-7 w-7 items-center justify-center">
              {/* Dot sits centred 6 px above the icon */}
              {isActive && (
                <span className="absolute -top-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
            </div>
            <span className="font-mono text-[9px]">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}