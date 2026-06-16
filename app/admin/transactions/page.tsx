import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { CreditCard, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

async function loadTransactions(status: string) {
  const admin = createAdminSupabaseClient()

  let query = admin
    .from('transactions')
    .select(
      `id, agreed_price, loka_fee, total_charged, status,
       fapshi_reference, pickup_attempts, funded_at, released_at, created_at,
       products!product_id ( id, name_en ),
       users!buyer_id ( id, full_name, phone )`,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, count } = await query
  return { transactions: data ?? [], total: count ?? 0 }
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  pending:   { label: 'Pending',   className: 'bg-surface-3 text-muted-foreground',  icon: Clock },
  funded:    { label: 'In Escrow', className: 'bg-primary/15 text-primary',           icon: CreditCard },
  confirmed: { label: 'Confirmed', className: 'bg-success/15 text-success',           icon: CheckCircle2 },
  released:  { label: 'Released',  className: 'bg-success/15 text-success',           icon: CheckCircle2 },
  disputed:  { label: 'Disputed',  className: 'bg-error/15 text-error',               icon: AlertTriangle },
  expired:   { label: 'Expired',   className: 'bg-surface-3 text-muted-foreground',   icon: XCircle },
  refunded:  { label: 'Refunded',  className: 'bg-surface-3 text-muted-foreground',   icon: XCircle },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold', cfg.className)}>
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

function formatXAF(amount: number) {
  return `${amount.toLocaleString('en-US')} XAF`
}

type SearchParamValue = string | string[] | undefined

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: SearchParamValue }>
}) {
  const sp     = await searchParams
  const status = typeof sp.status === 'string' ? sp.status : 'all'
  const { transactions, total } = await loadTransactions(status)

  const FILTER_TABS = [
    { label: 'All',      value: 'all' },
    { label: 'Escrow',   value: 'funded' },
    { label: 'Released', value: 'released' },
    { label: 'Disputed', value: 'disputed' },
    { label: 'Expired',  value: 'expired' },
  ]

  return (
    <div className="p-5 md:p-8">
      <div className="mb-6">
        <h1 className="font-syne text-[24px] font-bold text-foreground">Transactions</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {total} transaction{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto">
        {FILTER_TABS.map(tab => (
          <Link
            key={tab.value}
            href={`/admin/transactions?status=${tab.value}`}
            className={cn(
              'shrink-0 rounded-xl px-4 py-2 text-[13px] font-medium transition-colors',
              status === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-2 text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <CreditCard size={40} className="text-muted-foreground" />
          <p className="font-syne text-[16px] font-bold text-foreground">No transactions</p>
          <p className="text-[13px] text-muted-foreground">None match this filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-surface-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-3 bg-surface-2">
                  <th className="px-4 py-3 font-mono text-[10px] uppercase text-muted-foreground">Buyer</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase text-muted-foreground">Product</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase text-muted-foreground">Attempts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-3">
                {transactions.map((tx) => {
                  const buyer   = (tx.users as { id: any; full_name?: string; phone?: string }[] | null)?.[0] ?? null
                  const product = (tx.products as { id: any; name_en?: string }[] | null)?.[0] ?? null
                  return (
                    <tr key={tx.id} className="bg-surface-1 hover:bg-surface-2">
                      <td className="px-4 py-3">
                        <p className="text-[13px] text-foreground">
                          {(buyer?.full_name as string) ?? '—'}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {(buyer?.phone as string) ?? ''}
                        </p>
                      </td>
                      <td className="max-w-[160px] px-4 py-3">
                        <p className="truncate text-[13px] text-foreground">
                          {(product?.name_en as string) ?? '—'}
                        </p>
                        {tx.fapshi_reference && (
                          <p className="font-mono text-[9px] text-muted-foreground">
                            {tx.fapshi_reference.slice(0, 12)}…
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-[13px] text-primary">
                          {formatXAF(tx.agreed_price as number)}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          Fee: {formatXAF(tx.loka_fee as number)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={tx.status as string} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {new Date(tx.created_at as string).toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'short',
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'font-mono text-[12px]',
                          (tx.pickup_attempts as number) >= 3 ? 'text-error' : 'text-muted-foreground',
                        )}>
                          {tx.pickup_attempts as number ?? 0}/5
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}