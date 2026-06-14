import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()
  const { data: vendor } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) return NextResponse.json({ error: 'No vendor profile' }, { status: 404 })

  const page   = Math.max(1, parseInt(req.nextUrl.searchParams.get('page')  ?? '1',  10))
  const limit  = Math.min(50, parseInt(req.nextUrl.searchParams.get('limit') ?? '20', 10))
  const offset = (page - 1) * limit

  const { data: products, error, count } = await admin
    .from('products')
    .select('*, categories(id, name_en)', { count: 'exact' })
    .eq('vendor_id', vendor.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: products ?? [], total: count ?? 0, page, limit })
}