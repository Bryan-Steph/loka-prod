import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/admin/assertAdmin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const ctx = await assertAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { admin } = ctx
  const status = req.nextUrl.searchParams.get('status') ?? 'all'
  const page   = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10))
  const limit  = 30
  const offset = (page - 1) * limit

  let query = admin
    .from('vendors')
    .select(
      `id, shop_name, shop_description, shop_avatar_url, address_text,
       verification_status, verified_at, suspension_reason, is_active, created_at,
       users!user_id ( id, full_name, phone ),
       verification_documents ( id, document_type, front_url, back_url, status, created_at )`,
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status !== 'all') {
    query = query.eq('verification_status', status)
  }

  const { data: vendors, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ vendors: vendors ?? [], total: count ?? 0, page, limit })
}