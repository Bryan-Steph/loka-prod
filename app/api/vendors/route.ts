import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

// ── GET /api/vendors — public homepage vendor listing ──────────────────────
export async function GET(req: NextRequest) {
  try {
    const admin = createAdminSupabaseClient()
    const limit = Math.min(20, parseInt(req.nextUrl.searchParams.get('limit') ?? '10', 10))

    const { data: vendors, error } = await admin
      .from('vendors')
      .select('id, shop_name, shop_avatar_url, verification_status, address_text, categories(id, name_en)')
      .eq('is_active', true)
      .eq('verification_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Count published products per vendor
    const ids = (vendors ?? []).map(v => v.id)
    const counts: Record<string, number> = {}

    if (ids.length > 0) {
      const { data: products } = await admin
        .from('products')
        .select('vendor_id')
        .in('vendor_id', ids)
        .eq('is_published', true)
        .is('deleted_at', null)

      for (const p of products ?? []) {
        counts[p.vendor_id] = (counts[p.vendor_id] ?? 0) + 1
      }
    }

    const result = (vendors ?? []).map(v => ({ ...v, product_count: counts[v.id] ?? 0 }))
    return NextResponse.json({ vendors: result })
  } catch (err) {
    console.error('[GET /api/vendors]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── POST /api/vendors — create vendor profile during onboarding step 1 ─────
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminSupabaseClient()

    // Return existing vendor profile silently (idempotent — onboarding can retry)
    const { data: existing } = await admin
      .from('vendors')
      .select('id, shop_name, verification_status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ vendor: existing, already_exists: true })
    }

    let body: Record<string, unknown> = {}
    try { body = await req.json() } catch { /* empty body is OK */ }

    const { data: vendor, error } = await admin
      .from('vendors')
      .insert({
        user_id:             user.id,
        shop_name:           (body.shop_name as string)        ?? 'My Shop',
        shop_description:    (body.shop_description as string) ?? null,
        category_id:         (body.category_id as string)      ?? null,
        address_text:        (body.address_text as string)      ?? null,
        latitude:            (body.latitude as number)          ?? null,
        longitude:           (body.longitude as number)         ?? null,
        operating_hours:     (body.operating_hours as object)   ?? null,
        years_trading:       (body.years_trading as string)     ?? null,
        verification_status: 'pending',
        is_active:           false,
      })
      .select()
      .single()

    if (error) {
      console.error('[POST /api/vendors]', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mark user as vendor role
    await admin.from('users').update({ role: 'vendor' }).eq('id', user.id)

    return NextResponse.json({ vendor }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/vendors] unhandled:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}