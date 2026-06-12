import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const CreateProductSchema = z.object({
  name_en:            z.string().min(2, 'Name too short').max(120),
  description_en:     z.string().max(500).optional().nullable(),
  price:              z.number().int('Price must be a whole number').positive(),
  condition:          z.enum(['new', 'used_good', 'used_fair', 'refurbished']),
  category_id:        z.string().uuid().optional().nullable(),
  photo_urls:         z.array(z.string().url()).min(1, 'At least one photo required').max(5),
  bargaining_allowed: z.boolean().default(false),
  min_bargain_price:  z.number().int().positive().optional().nullable(),
  stock_status:       z.enum(['in_stock', 'out_of_stock', 'on_order']).default('in_stock'),
})

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()
  const { data: vendor } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) {
    return NextResponse.json({ error: 'Complete vendor onboarding first' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = CreateProductSchema.safeParse(body)

  if (!parsed.success) {
    // Flatten to a single string — frontend checks typeof d.error === 'string'
    const firstError =
      Object.values(parsed.error.flatten().fieldErrors).flat()[0] ??
      'Validation failed — check all fields'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const {
    name_en, description_en, price, condition, category_id,
    photo_urls, bargaining_allowed, min_bargain_price, stock_status,
  } = parsed.data

  const { data: product, error } = await admin
    .from('products')
    .insert({
      vendor_id:          vendor.id,
      name_en,
      description_en:     description_en ?? null,
      price,
      condition,
      category_id:        category_id ?? null,
      photo_urls,
      bargaining_allowed,
      min_bargain_price:  bargaining_allowed ? (min_bargain_price ?? null) : null,
      stock_status,
      is_published:       true,
      view_count:         0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ product }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const admin = createAdminSupabaseClient()
  const { searchParams } = req.nextUrl

  const categoryId = searchParams.get('category_id')
  const vendorId   = searchParams.get('vendor_id')
  const page       = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit      = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10))
  const offset     = (page - 1) * limit

  let query = admin
    .from('products')
    .select('*, vendors(id, shop_name, shop_avatar_url, verification_status)', { count: 'exact' })
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (categoryId) query = query.eq('category_id', categoryId)
  if (vendorId)   query = query.eq('vendor_id', vendorId)

  const { data: products, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: products ?? [], total: count ?? 0, page, limit })
}