import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { video_url } = await req.json()
  if (!video_url) {
    return NextResponse.json({ error: 'Verification video is required' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()
  const { data: vendor } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) {
    return NextResponse.json({ error: 'Complete shop setup first' }, { status: 404 })
  }

  // Upsert — allow resubmission
  const { data: existing } = await admin
    .from('verification_documents')
    .select('id')
    .eq('vendor_id', vendor.id)
    .maybeSingle()

  const payload = {
    vendor_id:     vendor.id,
    document_type: 'verification_video',
    front_url:     video_url,   // reusing front_url column for the video URL
    back_url:      null,
    status:        'pending',
  }

  if (existing) {
    const { data, error } = await admin
      .from('verification_documents')
      .update({ front_url: video_url, status: 'pending' })
      .eq('vendor_id', vendor.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ document: data })
  }

  const { data, error } = await admin
    .from('verification_documents')
    .insert(payload)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ document: data }, { status: 201 })
}