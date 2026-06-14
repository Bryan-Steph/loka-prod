import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminSupabase = createAdminSupabaseClient()
    const { data: vendor, error: vendorError } = await adminSupabase
      .from('vendors')
      .select(`
        id, shop_name, shop_description, shop_avatar_url,
        category_id, verification_status, is_active,
        latitude, longitude, address_text,
        total_views, report_count, created_at
      `)
      .eq('user_id', user.id)
      .single()

    if (vendorError || !vendor) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 })
    }

    return NextResponse.json({ vendor })
  } catch (e) {
    console.error('[vendors/me GET]', e)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const ALLOWED = [
      'shop_name', 'shop_description', 'shop_avatar_url',
      'category_id', 'latitude', 'longitude', 'address_text',
    ] as const
    const patch: Record<string, unknown> = {}
    for (const key of ALLOWED) {
      if (body[key] !== undefined) patch[key] = body[key]
    }

    const adminSupabase = createAdminSupabaseClient()
    const { data: vendor, error: updateError } = await adminSupabase
      .from('vendors')
      .update(patch)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    return NextResponse.json({ vendor })
  } catch (e) {
    console.error('[vendors/me PATCH]', e)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}