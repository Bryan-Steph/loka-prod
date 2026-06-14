import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminSupabase = await createAdminSupabaseClient()
    const { data: vendor, error: vendorError } = await adminSupabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (vendorError || !vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const [productsRes, viewsRes, enquiriesRes] = await Promise.all([
      adminSupabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', vendor.id)
        .eq('is_published', true)
        .is('deleted_at', null),

      adminSupabase
        .from('products')
        .select('view_count')
        .eq('vendor_id', vendor.id)
        .is('deleted_at', null),

      adminSupabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .eq('vendor_id', vendor.id),
    ])

    return NextResponse.json({
      stats: {
        activeProducts: productsRes.count  ?? 0,
        totalViews:     (viewsRes.data ?? []).reduce((s, p) => s + (p.view_count ?? 0), 0),
        enquiries:      enquiriesRes.count ?? 0,
      },
    })
  } catch (e) {
    console.error('[vendors/me/stats GET]', e)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}