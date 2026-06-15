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

  if (!vendor) return NextResponse.json({ products: [] })

  const { data: products, error } = await admin
    .from('products')
    .select('id, name_en, price, stock_status, is_published, condition, photo_urls, view_count, bargaining_allowed, category_id, categories(name_en), created_at')
    .eq('vendor_id', vendor.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: products ?? [] })
}