import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: vendorId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  const { data: existing } = await admin
    .from('vendor_follows')
    .select('id')
    .eq('vendor_id', vendorId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await admin.from('vendor_follows').delete().eq('id', existing.id)
  } else {
    await admin.from('vendor_follows').insert({ vendor_id: vendorId, user_id: user.id })
  }

  const { count } = await admin
    .from('vendor_follows')
    .select('id', { count: 'exact', head: true })
    .eq('vendor_id', vendorId)

  return NextResponse.json({ following: !existing, follower_count: count ?? 0 })
}