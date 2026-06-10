'use client'


//vendor/dashboard/page.tsx
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Menu, Bell, User, X, LayoutDashboard, Package,
  MessageSquare, Store, CreditCard, Settings, LogOut,
  Eye, Plus, ChevronRight, Inbox, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',    active: true },
  { icon: Package,         label: 'Products' },
  { icon: MessageSquare,   label: 'Enquiries' },
  { icon: Store,           label: 'My Shop' },
  { icon: CreditCard,      label: 'Subscription' },
  { icon: Bell,            label: 'Notifications' },
  { icon: Settings,        label: 'Settings' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

interface Stats {
  activeProducts: number
  totalViews: number
  enquiries: number
}

function VendorDashboardContent() {
  const params = useSearchParams()
  const { logout, user } = useAuth()

  const [drawer, setDrawer]             = useState(false)
  const [toast, setToast]               = useState(params.get('published') === '1')
  const [stats, setStats]               = useState<Stats | null>(null)
  const [vendorName, setVendorName]     = useState<string | null>(null)
  const [loggingOut, setLoggingOut]     = useState(false)

  useEffect(() => {
    // Fetch real name
    fetch('/api/users/me')
      .then((r) => r.json())
      .then((d) => { if (d.profile?.full_name) setVendorName(d.profile.full_name) })

    // Fetch real stats
    fetch('/api/vendors/me/stats')
      .then((r) => r.json())
      .then((d) => { if (d.stats) setStats(d.stats) })
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try { await logout() } catch { setLoggingOut(false) }
  }

  const displayName = vendorName ?? user?.full_name ?? '…'

  return (
    <div className="min-h-screen">
     {toast && (
  <div className="fixed left-4 right-4 top-4 z-50 flex items-center gap-3 rounded-xl border border-success/30 bg-surface-1 p-3.5 shadow-xl animate-in slide-in-from-top-2">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15">
      <CheckCircle2 size={16} className="text-success" />
    </div>
    <span className="flex-1 text-[13px] font-medium text-foreground">
      Product published successfully!
    </span>
    <button
      onClick={() => setToast(false)}
      className="text-muted-foreground"
      aria-label="Dismiss"
    >
      <X size={16} />
    </button>
  </div>
)}

      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button
          onClick={() => setDrawer(true)}
          className="flex h-10 w-10 items-center justify-center text-foreground"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <span className="font-syne text-[24px] font-extrabold text-primary">LOKA</span>
        <div className="flex items-center gap-1">
          <button
            className="flex h-10 w-10 items-center justify-center text-muted-foreground"
            aria-label="Notifications"
          >
            <Bell size={22} />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
            <User size={16} />
          </span>
        </div>
      </header>

      {/* Drawer */}
      {drawer && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setDrawer(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-surface-1 shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-surface-3 px-4">
              <span className="font-syne text-[22px] font-extrabold text-primary">LOKA</span>
              <button onClick={() => setDrawer(false)} className="text-muted-foreground" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label}
                    className={cn(
                      'flex h-12 w-full items-center gap-3 px-4 text-[14px] transition-colors',
                      item.active
                        ? 'border-l-2 border-primary bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-surface-2',
                    )}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </button>
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

      {/* Main */}
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-5">
        <h1 className="font-syne text-[20px] font-bold text-foreground">
          {greeting()}, {displayName}
        </h1>

        {/* Subscription placeholder — wired in Sprint 7 */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <CreditCard size={20} className="shrink-0 text-primary" />
          <span className="text-[14px] text-foreground">Subscription</span>
          <span className="ml-auto rounded-full bg-surface-3 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            Sprint 7
          </span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>

        {/* Stats */}
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto md:grid md:grid-cols-3">
          <StatCard
            icon={Package}
            value={stats ? String(stats.activeProducts) : '—'}
            label="Active Products"
            loading={!stats}
          />
          <StatCard
            icon={Eye}
            value={stats ? String(stats.totalViews) : '—'}
            label="Total Views"
            loading={!stats}
          />
          <StatCard
            icon={MessageSquare}
            value={stats ? String(stats.enquiries) : '—'}
            label="Enquiries"
            loading={!stats}
          />
        </div>

        {/* Quick actions */}
        <div className="mt-4 flex gap-2">
          <Link
            href="/vendor/products/new"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-[13px] font-semibold text-primary-foreground"
          >
            <Plus size={16} />
            Add Product
          </Link>
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-surface-3 py-3 text-[13px] font-medium text-foreground">
            <Store size={16} />
            My Shop
          </button>
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-surface-3 py-3 text-[13px] font-medium text-foreground">
            <Package size={16} />
            Products
          </button>
        </div>

        {/* Enquiries — empty state until Sprint 4 */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-syne text-[14px] font-bold text-foreground">
            Recent Enquiries
          </h2>
          <button className="text-[12px] text-primary">View all →</button>
        </div>

        <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl border border-surface-3 bg-surface-1 py-10">
          <Inbox size={32} className="text-muted-foreground" />
          <p className="text-[13px] text-muted-foreground">No enquiries yet</p>
          <p className="text-[11px] text-muted-foreground">
            Buyers will appear here once they start bargaining
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
  loading,
}: {
  icon: typeof Package
  value: string
  label: string
  loading?: boolean
}) {
  return (
    <div className="flex w-[140px] shrink-0 flex-col items-center gap-1 rounded-2xl border border-surface-3 bg-surface-1 p-4 md:w-auto">
      <Icon size={24} className={cn('text-primary', loading && 'opacity-40')} />
      <span className={cn(
        'font-mono text-[32px] leading-tight text-primary transition-opacity',
        loading && 'opacity-40',
      )}>
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}

export default function VendorDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VendorDashboardContent />
    </Suspense>
  )
}