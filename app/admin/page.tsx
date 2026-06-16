import Link from 'next/link'
import {
  Building2, Users, Package, CreditCard,
  Clock, CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

async function loadStats() {
  const admin = createAdminSupabaseClient()

  const [
    allVendors, pendingVendors, approvedVendors, suspendedVendors,
    allBuyers, publishedProducts,
    fundedTxns, releasedTxns, disputedTxns,
  ] = await Promise.all([
    admin.from('vendors').select('*', { count: 'exact', head: true }),
    admin.from('vendors').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    admin.from('vendors').select('*', { count: 'exact', head: true }).eq('verification_status', 'approved'),
    admin.from('vendors').select('*', { count: 'exact', head: true }).eq('verification_status', 'suspended'),
    admin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
    admin.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true),
    admin.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'funded'),
    admin.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'released'),
    admin.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'disputed'),
  ])

  return {
    vendors:  { total: allVendors.count ?? 0, pending: pendingVendors.count ?? 0, approved: approvedVendors.count ?? 0, suspended: suspendedVendors.count ?? 0 },
    buyers:   allBuyers.count        ?? 0,
    products: publishedProducts.count ?? 0,
    transactions: { funded: fundedTxns.count ?? 0, released: releasedTxns.count ?? 0, disputed: disputedTxns.count ?? 0 },
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'text-primary',
  href,
}: {
  label: string
  value: number
  icon: typeof Building2
  tone?: string
  href?: string
}) {
  const card = (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-surface-3 bg-surface-1 p-5 transition-colors hover:border-primary/30">
      <Icon size={20} className={tone} />
      <span className={`font-mono text-[32px] font-bold leading-none ${tone}`}>
        {value.toLocaleString()}
      </span>
      <span className="text-[12px] text-muted-foreground">{label}</span>
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}

export default async function AdminDashboardPage() {
  const stats = await loadStats()

  return (
    <div className="p-5 md:p-8">
      <div className="mb-8">
        <h1 className="font-syne text-[26px] font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          LOKA Marketplace — Admin Overview
        </p>
      </div>

      {/* Alert banners */}
      <div className="mb-6 space-y-3">
        {stats.vendors.pending > 0 && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-primary/10 p-4">
            <div className="flex items-center gap-3">
              <Clock size={18} className="shrink-0 text-primary" />
              <div>
                <p className="font-syne text-[14px] font-bold text-foreground">
                  {stats.vendors.pending} vendor{stats.vendors.pending !== 1 ? 's' : ''} awaiting review
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Review their verification documents to approve or reject
                </p>
              </div>
            </div>
            <Link
              href="/admin/vendors?status=pending"
              className="shrink-0 rounded-xl bg-primary px-4 py-2 font-mono text-[12px] font-semibold text-primary-foreground"
            >
              Review Now
            </Link>
          </div>
        )}

        {stats.transactions.disputed > 0 && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-error/40 bg-error/10 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0 text-error" />
              <div>
                <p className="font-syne text-[14px] font-bold text-foreground">
                  {stats.transactions.disputed} disputed transaction{stats.transactions.disputed !== 1 ? 's' : ''}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Manual resolution required
                </p>
              </div>
            </div>
            <Link
              href="/admin/transactions?status=disputed"
              className="shrink-0 rounded-xl bg-error px-4 py-2 font-mono text-[12px] font-semibold text-background"
            >
              View
            </Link>
          </div>
        )}
      </div>

      {/* Vendor stats */}
      <section className="mb-6">
        <h2 className="mb-3 font-syne text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
          Vendors
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Total Vendors"    value={stats.vendors.total}     icon={Building2}    tone="text-foreground" />
          <StatCard label="Pending Review"   value={stats.vendors.pending}   icon={Clock}        tone="text-primary"   href="/admin/vendors?status=pending" />
          <StatCard label="Approved"         value={stats.vendors.approved}  icon={CheckCircle2} tone="text-success" />
          <StatCard label="Suspended"        value={stats.vendors.suspended} icon={XCircle}      tone="text-error" />
        </div>
      </section>

      {/* Platform stats */}
      <section className="mb-6">
        <h2 className="mb-3 font-syne text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
          Platform
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard label="Registered Buyers"    value={stats.buyers}                 icon={Users}     tone="text-foreground" />
          <StatCard label="Published Products"   value={stats.products}               icon={Package}   tone="text-foreground" />
          <StatCard label="Released Payments"    value={stats.transactions.released}  icon={CreditCard} tone="text-success" />
        </div>
      </section>

      {/* Escrow summary */}
      {stats.transactions.funded > 0 && (
        <section>
          <h2 className="mb-3 font-syne text-[13px] font-bold uppercase tracking-wider text-muted-foreground">
            Escrow
          </h2>
          <div className="rounded-2xl border border-surface-3 bg-surface-1 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-syne text-[16px] font-bold text-foreground">
                  {stats.transactions.funded} active escrow{stats.transactions.funded !== 1 ? 's' : ''}
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Awaiting pickup code confirmation from vendors
                </p>
              </div>
              <Link
                href="/admin/transactions?status=funded"
                className="rounded-xl border border-surface-3 px-3 py-2 text-[12px] text-foreground hover:bg-surface-2"
              >
                View →
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}