import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()
  const { data: vendor, error } = await admin
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vendor: vendor ?? null })
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  const { data: existing } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Vendor already exists' }, { status: 409 })
  }

  const body = await req.json()
  const {
    shop_name, shop_description, category_id,
    operating_hours, years_trading,
  } = body

  if (!shop_name || typeof shop_name !== 'string' || !shop_name.trim()) {
    return NextResponse.json({ error: 'Shop name is required' }, { status: 400 })
  }

  const { data: vendor, error } = await admin
    .from('vendors')
    .insert({
      user_id:           user.id,
      shop_name:         shop_name.trim(),
      shop_description:  shop_description ?? null,
      category_id:       category_id ?? null,
      operating_hours:   operating_hours ?? null,
      years_trading:     years_trading ?? null,
      verification_status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vendor }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  const { data: existing } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!existing) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

  const body = await req.json()
  const allowedFields = [
    'shop_name', 'shop_description', 'category_id', 'operating_hours',
    'years_trading', 'latitude', 'longitude', 'address_text', 'shop_avatar_url',
  ]

  const updates: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data: vendor, error } = await admin
    .from('vendors')
    .update(updates)
    .eq('id', existing.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vendor })
}