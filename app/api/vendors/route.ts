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
    .limit(limit)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!vendors?.length) return NextResponse.json({ vendors: [] })

  // Count published products per vendor
  const ids = vendors.map((v) => v.id)
  const { data: rows } = await admin
    .from('products')
    .select('vendor_id')
    .in('vendor_id', ids)
    .eq('is_published', true)
    .is('deleted_at', null)

  const countMap = (rows ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.vendor_id] = (acc[p.vendor_id] ?? 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    vendors: vendors.map((v) => ({
      id:                 v.id,
      shop_name:          v.shop_name,
      shop_avatar_url:    v.shop_avatar_url,
      verification_status:v.verification_status,
      address_text:       v.address_text,
      categories:         v.categories,
      product_count:      countMap[v.id] ?? 0,
    })),
  })
}