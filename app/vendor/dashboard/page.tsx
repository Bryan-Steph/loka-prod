'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  X, Package, Eye, MessageSquare,
  Plus, Store, Inbox, CheckCircle2,
  CreditCard, ChevronRight, Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { VendorShell } from '@/components/vendor/VendorShell'
import { VerificationBanner } from '@/components/vendor/VerificationBanner'
import { PWAInstallButton } from '@/components/ui/PWAInstallButton'


function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function FreeTrialCard({ vendorCreatedAt }: { vendorCreatedAt?: string }) {
  const [daysLeft, setDaysLeft] = useState<number>(7)

  useEffect(() => {
    if (!vendorCreatedAt) return
    const created   = new Date(vendorCreatedAt).getTime()
    const trialEnd  = created + 7 * 24 * 60 * 60 * 1000
    const remaining = Math.ceil((trialEnd - Date.now()) / (1000 * 60 * 60 * 24))
    setDaysLeft(Math.max(0, remaining))
  }, [vendorCreatedAt])

  const expired = daysLeft === 0

  return (
    <Link
      href="/vendor/subscription"
      className={cn(
        'mt-4 flex items-center gap-3 rounded-2xl border p-4 transition-colors',
        expired ? 'border-error/40 bg-error/10' : 'border-primary/30 bg-primary/5',
      )}
    >
      <CreditCard size={20} className={expired ? 'text-error' : 'text-primary'} />
      <div className="flex-1">
        <p className="text-[14px] font-semibold text-foreground">
          {expired ? 'Free Trial Expired' : 'Free Trial Active'}
        </p>
        <p className={cn('font-mono text-[11px]', expired ? 'text-error' : 'text-muted-foreground')}>
          {expired ? 'Subscribe to keep posting products' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
        </p>
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </Link>
  )
}

interface Stats {
  activeProducts: number
  totalViews: number
  enquiries: number
}

interface VendorInfo {
  verification_status: string | null
  suspension_reason: string | null
}

function VendorDashboardContent() {
  const params = useSearchParams()
  const { user } = useAuth()

  const [toast, setToast]           = useState(params.get('published') === '1')
  const [stats, setStats]           = useState<Stats | null>(null)
  const [vendorName, setVendorName] = useState<string | null>(null)
  const [vendor, setVendor] = useState<VendorInfo & { created_at?: string } | null>(null)

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json())
      .then(d => { if (d.profile?.full_name) setVendorName(d.profile.full_name) })

    fetch('/api/vendors/me/stats')
      .then(r => r.json())
      .then(d => { if (d.stats) setStats(d.stats) })

    fetch('/api/vendors/me')
      .then(r => r.json())
      .then(d => {
        if (d.vendor) {
          setVendor({
            verification_status: d.vendor.verification_status ?? null,
            suspension_reason: d.vendor.suspension_reason ?? null,
              created_at:          d.vendor.created_at ?? null,
          })
        }
      })
}, [params]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayName = vendorName ?? user?.full_name ?? '…'
  const isApproved = vendor?.verification_status === 'approved'
  const verificationKnown = vendor !== null

  return (
    <VendorShell>
      {/* ── Toast ─────────────────────────────────────────────── */}
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

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-5">
        <h1 className="font-syne text-[20px] font-bold text-foreground">
          {greeting()}, {displayName}
        </h1>

        {/* Verification banner — hidden once approved */}
        {verificationKnown && (
          <VerificationBanner
            status={vendor?.verification_status}
            reason={vendor?.suspension_reason}
          />
        )}

        {/* Subscription placeholder — wired in Sprint 7 */}
     <FreeTrialCard vendorCreatedAt={vendor?.created_at} />

     <div className="mt-3">
  <PWAInstallButton />
</div>


        {/* Stats */}
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto md:grid md:grid-cols-3">
          <StatCard icon={Package}        value={stats ? String(stats.activeProducts) : '—'} label="Active Products" loading={!stats} />
          <StatCard icon={Eye}            value={stats ? String(stats.totalViews)     : '—'} label="Total Views"     loading={!stats} />
          <StatCard icon={MessageSquare}  value={stats ? String(stats.enquiries)      : '—'} label="Enquiries"       loading={!stats} />
        </div>

        {/* Quick actions */}
        <div className="mt-4 flex gap-2">
          <Link
            href="/vendor/products/new"
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-3 text-[13px] font-semibold text-primary-foreground"
          >
            {!isApproved && verificationKnown && (
              <Lock size={12} className="absolute right-2.5 top-2.5 text-primary-foreground/70" />
            )}
            <Plus size={16} />
            Add Product
          </Link>
          <Link
            href="/vendor/shop"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-surface-3 py-3 text-[13px] font-medium text-foreground"
          >
            <Store size={16} />
            My Shop
          </Link>
          <Link
            href="/vendor/products"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-surface-3 py-3 text-[13px] font-medium text-foreground"
          >
            <Package size={16} />
            Products
          </Link>
        </div>

        {/* Recent Enquiries — wired Sprint 4 */}
        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-syne text-[14px] font-bold text-foreground">Recent Enquiries</h2>
          <Link href="/vendor/enquiries" className="text-[12px] text-primary">View all →</Link>
        </div>

        <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl border border-surface-3 bg-surface-1 py-10">
          <Inbox size={32} className="text-muted-foreground" />
          <p className="text-[13px] text-muted-foreground">No enquiries yet</p>
          <p className="text-[11px] text-muted-foreground">
            Buyers will appear here once they start bargaining
          </p>
        </div>
      </div>
    </VendorShell>
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
      <span className={cn('font-mono text-[32px] leading-tight text-primary transition-opacity', loading && 'opacity-40')}>
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