import { NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/admin/assertAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const ctx = await assertAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { admin } = ctx

  const [
    allVendors,
    pendingVendors,
    approvedVendors,
    suspendedVendors,
    rejectedVendors,
    allBuyers,
    publishedProducts,
    pendingTxns,
    fundedTxns,
    releasedTxns,
    disputedTxns,
  ] = await Promise.all([
    admin.from('vendors').select('*', { count: 'exact', head: true }),
    admin.from('vendors').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    admin.from('vendors').select('*', { count: 'exact', head: true }).eq('verification_status', 'approved'),
    admin.from('vendors').select('*', { count: 'exact', head: true }).eq('verification_status', 'suspended'),
    admin.from('vendors').select('*', { count: 'exact', head: true }).eq('verification_status', 'rejected'),
    admin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
    admin.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true),
    admin.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'funded'),
    admin.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'released'),
    admin.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'disputed'),
  ])

  return NextResponse.json({
    vendors: {
      total:     allVendors.count     ?? 0,
      pending:   pendingVendors.count  ?? 0,
      approved:  approvedVendors.count ?? 0,
      suspended: suspendedVendors.count ?? 0,
      rejected:  rejectedVendors.count ?? 0,
    },
    buyers:   allBuyers.count        ?? 0,
    products: publishedProducts.count ?? 0,
    transactions: {
      pending:  pendingTxns.count  ?? 0,
      funded:   fundedTxns.count   ?? 0,
      released: releasedTxns.count ?? 0,
      disputed: disputedTxns.count ?? 0,
    },
  })
}