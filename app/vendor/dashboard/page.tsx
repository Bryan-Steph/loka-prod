'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Menu,
  Bell,
  User,
  X,
  LayoutDashboard,
  Package,
  MessageSquare,
  Store,
  CreditCard,
  Settings,
  LogOut,
  Sun,
  Eye,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import { Toast } from '@/components/ui/toast'
import { RECENT_ENQUIRIES, formatXAF } from '@/lib/data'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Package, label: 'Products' },
  { icon: MessageSquare, label: 'Enquiries' },
  { icon: Store, label: 'My Shop' },
  { icon: CreditCard, label: 'Subscription' },
  { icon: Bell, label: 'Notifications' },
  { icon: Settings, label: 'Settings' },
]

function VendorDashboardContent() {
  const params = useSearchParams()
  const [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState(params.get('published') === '1')

  return (
    <div className="min-h-screen">
      {toast && (
        <Toast
          message="Product published successfully!"
          variant="success"
          onClose={() => setToast(false)}
        />
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
              <span className="font-syne text-[22px] font-extrabold text-primary">
                LOKA
              </span>
              <button
                onClick={() => setDrawer(false)}
                className="text-muted-foreground"
                aria-label="Close menu"
              >
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
            <button className="flex h-14 items-center gap-3 border-t border-surface-3 px-4 text-[14px] text-error">
              <LogOut size={18} />
              Sign Out
            </button>
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-5">
        <h1 className="flex items-center gap-2 font-syne text-[20px] font-bold text-foreground">
          <Sun size={20} className="text-primary" />
          Good morning, Mama Agnes
        </h1>

        {/* Subscription card */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <CreditCard size={20} className="shrink-0 text-primary" />
          <span className="text-[14px] text-foreground">Basic Plan</span>
          <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary">
            23 days left
          </span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>

        {/* Stats */}
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto md:grid md:grid-cols-3">
          <StatCard icon={Package} value="12" label="Active Products" />
          <StatCard icon={Eye} value="148" label="Views Today" />
          <StatCard icon={MessageSquare} value="7" label="New Enquiries" />
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

        {/* Recent enquiries */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-syne text-[14px] font-bold text-foreground">
            Recent Enquiries
          </h2>
          <button className="text-[12px] text-primary">View all →</button>
        </div>
        <div className="mt-3 space-y-2.5">
          {RECENT_ENQUIRIES.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-xl border border-surface-3 bg-surface-1 p-3.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
                <User size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-foreground">{e.buyer}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {e.product}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-mono text-[13px] text-primary">
                  {formatXAF(e.amount)}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={e.status} />
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {e.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Package
  value: string
  label: string
}) {
  return (
    <div className="flex w-[140px] shrink-0 flex-col items-center gap-1 rounded-2xl border border-surface-3 bg-surface-1 p-4 md:w-auto">
      <Icon size={24} className="text-primary" />
      <span className="font-mono text-[32px] leading-tight text-primary">{value}</span>
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
