import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'


//app/api/vendors/me/route.ts
async function getAuthUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()
  const { data: vendor, error } = await admin
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code === 'PGRST116') {
    return NextResponse.json({ vendor: null })
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vendor })
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  const { data: existing } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'Vendor profile already exists — use PATCH to update' },
      { status: 409 }
    )
  }

  const body = await req.json()
  const { shop_name, shop_description, category_id, operating_hours, years_trading } = body

  if (!shop_name?.trim()) {
    return NextResponse.json({ error: 'Shop name is required' }, { status: 400 })
  }

  const { data: vendor, error } = await admin
    .from('vendors')
    .insert({
      user_id:             user.id,
      shop_name:           shop_name.trim(),
      shop_description:    shop_description?.trim() ?? null,
      category_id:         category_id ?? null,
      operating_hours:     operating_hours ?? null,
      years_trading:       years_trading ?? null,
      is_active:           true,
      verification_status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('[vendors/me POST]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ vendor }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const PATCHABLE = [
    'shop_name', 'shop_description', 'category_id', 'shop_avatar_url',
    'latitude', 'longitude', 'address_text',
    'operating_hours', 'years_trading',
  ] as const

  const updates: Record<string, unknown> = {}
  for (const key of PATCHABLE) {
    if (key in body) updates[key] = body[key]
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()
  const { data: vendor, error } = await admin
    .from('vendors')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ vendor })
}