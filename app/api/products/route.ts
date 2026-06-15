import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

const CreateProductSchema = z.object({
  name_en:            z.string().min(2, 'Name must be at least 2 characters').max(120),
  description_en:     z.string().max(500).optional().nullable(),
  price:              z.number().int().positive(),
  condition:          z.enum(['new', 'used', 'refurbished']),
  category_id:        z.string().optional().nullable(),   // ← no .uuid() — IDs come from our own DB
  photo_urls:         z.array(z.string().url()).min(1, 'At least one photo required').max(5),
  bargaining_allowed: z.boolean().default(false),
  stock_status:       z.enum(['in_stock', 'out_of_stock']).default('in_stock'),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
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

  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const parsed = CreateProductSchema.safeParse(body)
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors
    console.error('[POST /api/products] Validation failed:', JSON.stringify(fieldErrors))
    // Return first field error as a plain string so the UI can display it directly
    const firstError = Object.values(fieldErrors)[0]?.[0] ?? 'Validation failed'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const {
    name_en, description_en, price, condition,
    category_id, photo_urls, bargaining_allowed, stock_status,
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
      stock_status,
      is_published:       true,
      view_count:         0,
    })
    .select()
    .single()

  if (error) {
    console.error('[POST /api/products] DB error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ product }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const admin = createAdminSupabaseClient()
  const { searchParams } = req.nextUrl

  const q          = searchParams.get('q')?.trim() || null
  const categoryId = searchParams.get('category_id') || null
  const vendorId   = searchParams.get('vendor_id') || null
  const bargainOk  = searchParams.get('bargain_ok') === 'true'
  const page       = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10))
  const limit      = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10))
  const offset     = (page - 1) * limit

  let query = admin
    .from('products')
    .select(
      `*, vendors(id, shop_name, shop_avatar_url, verification_status, address_text),
       categories(id, name_en)`,
      { count: 'exact' },
    )
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (q)          query = query.textSearch('search_vector', q, { type: 'websearch', config: 'english' })
  if (categoryId) query = query.eq('category_id', categoryId)
  if (vendorId)   query = query.eq('vendor_id', vendorId)
  if (bargainOk)  query = query.eq('bargaining_allowed', true)

  const { data: products, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const visible = (products ?? []).filter((p: Record<string, unknown>) => {
    const v = p.vendors as Record<string, unknown> | null
    return v?.verification_status === 'approved'
  })

  return NextResponse.json({ products: visible, total: count ?? 0, page, limit })
}