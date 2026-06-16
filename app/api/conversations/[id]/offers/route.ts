// app/api/conversations/[id]/offers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { assertParticipant } from '../../_lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }

  const price = Number(body.offered_price)
  if (!Number.isInteger(price) || price <= 0) {
    return NextResponse.json({ error: 'offered_price must be a positive whole number (XAF)' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()
  const participant = await assertParticipant(admin, id, user.id)
  if (!participant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // ← CRITICAL: get product_id from conversation — this was the bug
  const { data: conversation, error: convErr } = await admin
    .from('conversations')
    .select('buyer_id, vendor_id, product_id')
    .eq('id', id)
    .single()

  if (convErr || !conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  if (!conversation.product_id) return NextResponse.json({ error: 'Conversation has no linked product' }, { status: 400 })

  // Expire previous pending offers
  await admin.from('bargain_offers').update({ status: 'expired' }).eq('conversation_id', id).eq('status', 'pending')

  const { data: offer, error: offerErr } = await admin
    .from('bargain_offers')
    .insert({
      conversation_id: id,
      buyer_id:        conversation.buyer_id,
      vendor_id:       conversation.vendor_id,
      product_id:      conversation.product_id,   // ← THE FIX
      offered_price:   price,
      offered_by:      user.id,
      status:          'pending',
    })
    .select()
    .single()

  if (offerErr) return NextResponse.json({ error: offerErr.message }, { status: 500 })

  const { data: message, error: msgErr } = await admin
    .from('messages')
    .insert({
      conversation_id: id,
      sender_id:       user.id,
      content:         `Offer: ${price.toLocaleString('en-US')} XAF`,
      message_type:    'offer',
      offer_id:        offer.id,
      is_read:         false,
    })
    .select()
    .single()

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 })

  await admin.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', id)

  return NextResponse.json({ offer, message }, { status: 201 })
}