import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

async function assertOwnership(productId: string, userId: string) {
  const admin = createAdminSupabaseClient()
  const { data: vendor } = await admin
    .from('vendors').select('id').eq('user_id', userId).single()
  if (!vendor) return null

  const { data: product } = await admin
    .from('products').select('id')
    .eq('id', productId).eq('vendor_id', vendor.id).single()

  return product ? vendor : null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const admin = createAdminSupabaseClient()

  const { data: product, error } = await admin
    .from('products')
    .select(`
      *,
      vendors(id, shop_name, shop_avatar_url, verification_status, address_text, latitude, longitude),
      categories(id, name_en, icon_emoji)
    `)
    .eq('id', id)
    .eq('is_published', true)
    .is('deleted_at', null)
    .single()

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // Increment view count — fire and forget
  admin.from('products')
    .update({ view_count: (product.view_count ?? 0) + 1 })
    .eq('id', id)
    .then(() => {})

  return NextResponse.json({ product })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owned = await assertOwnership(id, user.id)
  if (!owned) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })

  const body = await req.json()
  const PATCHABLE = [
    'name_en', 'description_en', 'price', 'condition', 'category_id',
    'photo_urls', 'bargaining_allowed', 'min_bargain_price', 'stock_status', 'is_published',
  ] as const

  const updates: Record<string, unknown> = {}
  for (const key of PATCHABLE) {
    if (key in body) updates[key] = body[key]
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()
  const { data: product, error } = await admin
    .from('products').update(updates).eq('id', id).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owned = await assertOwnership(id, user.id)
  if (!owned) return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })

  const admin = createAdminSupabaseClient()
  // Soft delete — set deleted_at, never hard DELETE
  const { error } = await admin
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}