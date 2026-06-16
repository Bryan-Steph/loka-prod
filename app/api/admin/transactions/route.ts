import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/admin/assertAdmin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const ctx = await assertAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { admin } = ctx
  const status = req.nextUrl.searchParams.get('status') ?? 'all'
  const page   = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10))
  const limit  = 50
  const offset = (page - 1) * limit

  let query = admin
    .from('transactions')
    .select(
      `id, agreed_price, loka_fee, total_charged, status,
       fapshi_reference, pickup_attempts, funded_at, confirmed_at, released_at, created_at,
       products!product_id ( id, name_en ),
       users!buyer_id    ( id, full_name, phone )`,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: transactions, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ transactions: transactions ?? [], total: count ?? 0, page, limit })
}