import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

// POST — save or update a push subscription from the browser
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const subscription = body?.subscription

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: 'Invalid PushSubscription object' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  // Upsert on endpoint — handles browser subscription rotation silently
  const { error } = await admin
    .from('push_subscriptions')
    .upsert(
      {
        user_id:  user.id,
        endpoint: subscription.endpoint,
        keys:     { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
      },
      { onConflict: 'endpoint' },
    )

  if (error) {
    console.error('[push/subscribe]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE — unsubscribe (user explicitly turns off notifications)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { endpoint } = await req.json()
  if (!endpoint) return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })

  const admin = createAdminSupabaseClient()
  await admin
    .from('push_subscriptions')
    .delete()
    .eq('user_id',  user.id)
    .eq('endpoint', endpoint)

  return NextResponse.json({ ok: true })
}