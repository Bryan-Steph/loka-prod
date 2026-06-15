import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!id) return NextResponse.json({ error: 'Missing vendor ID' }, { status: 400 })

  const admin = createAdminSupabaseClient()

  // Public vendor profile — phone number intentionally excluded
  const { data: vendor, error } = await admin
    .from('vendors')
    .select(
      'id, shop_name, shop_description, shop_avatar_url, ' +
      'address_text, latitude, longitude, verification_status, operating_hours',
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[GET /api/vendors/[id]]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  // Published products only
  const { data: products } = await admin
    .from('products')
    .select(
      'id, name_en, price, condition, photo_urls, bargaining_allowed, ' +
      'stock_status, view_count, vendor_id, categories ( name_en )',
    )
    .eq('vendor_id', (vendor as any).id)
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(24)

  // Follower count
  const { count: followerCount } = await admin
    .from('vendor_follows')
    .select('id', { count: 'exact', head: true })
    .eq('vendor_id', (vendor as any).id)

  // Is the current user following? Best-effort — guests see false, no crash
  let is_following = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: row } = await admin
        .from('vendor_follows')
        .select('id')
        .eq('vendor_id', (vendor as any).id)
        .eq('user_id', user.id)
        .maybeSingle()
      is_following = !!row
    }
  } catch {
    // unauthenticated visitors — page still renders correctly
  }

  return NextResponse.json({
    vendor,
    products: products ?? [],
    follower_count: followerCount ?? 0,
    is_following,
  })
}