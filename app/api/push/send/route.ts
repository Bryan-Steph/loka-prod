import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { sendPushToUser } from '@/lib/push/webpush'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()
  const { data: profile } = await admin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { user_id, title, body, url } = await req.json()
  if (!user_id || !title || !body) {
    return NextResponse.json({ error: 'user_id, title, and body are required' }, { status: 400 })
  }

  await sendPushToUser(user_id, { title, body, url })
  return NextResponse.json({ ok: true })
}