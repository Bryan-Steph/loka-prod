'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Store, Users, CreditCard,
  ArrowLeft, Menu, Shield, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin',              label: 'Dashboard',    icon: LayoutDashboard, exact: true },
  { href: '/admin/vendors',      label: 'Vendors',      icon: Store            },
  { href: '/admin/users',        label: 'Users',        icon: Users            },
  { href: '/admin/transactions', label: 'Transactions', icon: CreditCard       },
]

function SidebarInner({
  adminName,
  pathname,
  onNavClick,
}: {
  adminName: string | null
  pathname: string
  onNavClick?: () => void
}) {
  return (
    <div className="flex h-full flex-col bg-surface-1">
      {/* Logomark */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-surface-3 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Shield size={14} className="text-primary-foreground" />
        </div>
        <span className="font-syne text-[15px] font-bold text-foreground">LOKA</span>
        <span className="rounded-full bg-error/20 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-error">
          Admin
        </span>
      </div>

      {/* Who's in */}
      <div className="shrink-0 border-b border-surface-3 px-5 py-3">
        <p className="font-mono text-[9px] uppercase text-muted-foreground">Signed in as</p>
        <p className="mt-0.5 truncate text-[13px] font-medium text-foreground">
          {adminName ?? 'Administrator'}
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavClick}
                className={cn(
                  'flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-foreground hover:bg-surface-2',
                )}
              >
                <Icon
                  size={16}
                  className={active ? 'text-primary' : 'text-muted-foreground'}
                />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="text-primary" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-surface-3 p-3">
        <Link
          href="/"
          onClick={onNavClick}
          className="flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] text-muted-foreground hover:bg-surface-2 hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to App
        </Link>
      </div>
    </div>
  )
}

export function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode
  adminName: string | null
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-[220px] shrink-0 border-r border-surface-3 md:block">
        <SidebarInner adminName={adminName} pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[220px] shadow-2xl md:hidden">
            <SidebarInner
              adminName={adminName}
              pathname={pathname}
              onNavClick={() => setOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-surface-3 bg-surface-1 px-4 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground hover:bg-surface-2"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="flex-1 font-syne text-[16px] font-bold text-foreground">
            LOKA Admin
          </span>
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-2"
            aria-label="Back to app"
          >
            <ArrowLeft size={18} />
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}