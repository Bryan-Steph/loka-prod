'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Menu, Bell, User, X,
  LayoutDashboard, Package, MessageSquare,
  Store, CreditCard, Settings, LogOut, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',     href: '/vendor/dashboard' },
  { icon: Package,         label: 'Products',      href: '/vendor/products'  },
  { icon: MessageSquare,   label: 'Enquiries',     href: '/vendor/enquiries' },
  { icon: Store,           label: 'My Shop',       href: '/vendor/shop'      },
  { icon: CreditCard,      label: 'Subscription',  href: '/vendor/subscription' },
  { icon: Bell,            label: 'Notifications', href: '/vendor/notifications' },
  { icon: Settings,        label: 'Settings',      href: '/vendor/settings'  },
]

interface VendorShellProps {
  children: React.ReactNode
}

export function VendorShell({ children }: VendorShellProps) {
  const pathname   = usePathname()
  const router     = useRouter()
  const { logout } = useAuth()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      router.push('/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex h-10 w-10 items-center justify-center text-foreground"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <span className="font-syne text-[24px] font-extrabold text-primary">Shopsy</span>

        <div className="flex items-center gap-1">
          <Link
            href="/vendor/notifications"
            className="flex h-10 w-10 items-center justify-center text-muted-foreground"
            aria-label="Notifications"
          >
            <Bell size={22} />
          </Link>
          <Link
            href="/vendor/settings"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted-foreground"
            aria-label="Settings"
          >
            <User size={16} />
          </Link>
        </div>
      </header>

      {/* ── Drawer ──────────────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-surface-1 shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-surface-3 px-4">
              <span className="font-syne text-[22px] font-extrabold text-primary">Shopsy</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-muted-foreground"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === '/vendor/dashboard'
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + '/')

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      'flex h-12 w-full items-center gap-3 px-4 text-[14px] transition-colors',
                      isActive
                        ? 'border-l-2 border-primary bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-surface-2',
                    )}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </Link>
                )
              })}
            </nav>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex h-14 items-center gap-3 border-t border-surface-3 px-4 text-[14px] text-error disabled:opacity-60"
            >
              <LogOut size={18} />
              {loggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </aside>
        </>
      )}

      {children}
    </div>
  )
}