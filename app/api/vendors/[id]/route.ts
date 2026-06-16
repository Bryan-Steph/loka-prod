import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const admin  = createAdminSupabaseClient()

  const [vendorRes, productsRes, followerRes] = await Promise.all([
    admin.from('vendors').select('id, shop_name, shop_description, shop_avatar_url, address_text, latitude, longitude, verification_status, operating_hours').eq('id', id).single(),
    admin.from('products').select('*, vendors(id, shop_name, shop_avatar_url, verification_status, address_text), categories(id, name_en)').eq('vendor_id', id).eq('is_published', true).is('deleted_at', null).order('created_at', { ascending: false }),
    admin.from('vendor_follows').select('id', { count: 'exact', head: true }).eq('vendor_id', id),
  ])

  if (vendorRes.error || !vendorRes.data) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
  }

  // Check if current user is following
  let is_following = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: follow } = await admin
        .from('vendor_follows')
        .select('id')
        .eq('vendor_id', id)
        .eq('buyer_id', user.id)
        .maybeSingle()
      is_following = !!follow
    }
  } catch { /* unauthenticated — fine */ }

  return NextResponse.json({
    vendor:         vendorRes.data,
    products:       productsRes.data ?? [],
    follower_count: followerRes.count ?? 0,
    is_following,
  })
}