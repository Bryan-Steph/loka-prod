import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const admin = createAdminSupabaseClient()
  const limit = Math.min(20, parseInt(req.nextUrl.searchParams.get('limit') ?? '10', 10))

  const { data: vendors, error } = await admin
    .from('vendors')
    .select('id, shop_name, shop_avatar_url, verification_status, address_text, categories(id, name_en)')
    .eq('is_active', true)
    .eq('verification_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids = (vendors ?? []).map((v) => v.id)
  const counts: Record<string, number> = {}

  if (ids.length > 0) {
    const { data: products } = await admin
      .from('products')
      .select('vendor_id')
      .in('vendor_id', ids)
      .eq('is_published', true)
      .is('deleted_at', null)

    for (const p of products ?? []) {
      counts[p.vendor_id] = (counts[p.vendor_id] ?? 0) + 1
    }
  }

  const result = (vendors ?? []).map((v) => ({ ...v, product_count: counts[v.id] ?? 0 }))
  return NextResponse.json({ vendors: result })
}