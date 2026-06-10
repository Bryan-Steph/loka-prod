import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

//app/api/vendors/identity/route.ts

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { front_url, back_url } = await req.json()
  if (!front_url || !back_url) {
    return NextResponse.json(
      { error: 'Both front and back ID images are required' },
      { status: 400 },
    )
  }

  const admin = createAdminSupabaseClient()

  const { data: vendor } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) {
    return NextResponse.json(
      { error: 'Complete shop setup first' },
      { status: 404 },
    )
  }

  // Upsert — allow resubmission
  const { data: existing } = await admin
    .from('verification_documents')
    .select('id')
    .eq('vendor_id', vendor.id)
    .single()

  if (existing) {
    const { data, error } = await admin
      .from('verification_documents')
      .update({ front_url, back_url, status: 'pending' })
      .eq('vendor_id', vendor.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ document: data })
  }

  const { data, error } = await admin
    .from('verification_documents')
    .insert({
      vendor_id:     vendor.id,
      document_type: 'national_id',
      front_url,
      back_url,
      status:        'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ document: data }, { status: 201 })
}