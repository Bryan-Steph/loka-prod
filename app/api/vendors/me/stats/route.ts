import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

//app/api/vendors/me/stats/route.ts

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  const { data: vendor } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const { count: activeProducts } = await admin
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('vendor_id', vendor.id)
    .eq('is_active', true)

  const { data: productViews } = await admin
    .from('products')
    .select('view_count')
    .eq('vendor_id', vendor.id)
    .eq('is_active', true)

  const totalViews = productViews?.reduce(
    (sum, p) => sum + (p.view_count ?? 0), 0
  ) ?? 0

  return NextResponse.json({
    stats: {
      activeProducts: activeProducts ?? 0,
      totalViews,
      enquiries: 0, // wired in Sprint 4
    },
  })
}