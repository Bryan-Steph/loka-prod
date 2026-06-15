import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()
  const { data: vendor } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!vendor) {
    return NextResponse.json({ stats: { activeProducts: 0, totalViews: 0, enquiries: 0 } })
  }

  const [productsRes, enquiriesRes] = await Promise.all([
    admin.from('products').select('view_count', { count: 'exact' })
      .eq('vendor_id', vendor.id).eq('is_published', true).is('deleted_at', null),
    admin.from('conversations').select('id', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id),
  ])

  const activeProducts = productsRes.count ?? 0
  const totalViews = (productsRes.data ?? []).reduce((sum, p) => sum + (p.view_count ?? 0), 0)
  const enquiries = enquiriesRes.count ?? 0

  return NextResponse.json({ stats: { activeProducts, totalViews, enquiries } })
}