import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { assertParticipant } from '../../_lib/auth'
import { sendPushToUser } from '@/lib/push/webpush'


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { offered_price } = await req.json()
  const price = Number(offered_price)
  if (!Number.isInteger(price) || price <= 0) {
    return NextResponse.json({ error: 'offered_price must be a positive whole number (XAF)' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()
  const participant = await assertParticipant(admin, id, user.id)
  if (!participant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // 1. Fetch conversation details + related relationship items (vendors & products) in one go
  const { data: conversation } = await admin
    .from('conversations')
    .select('buyer_id, vendor_id, product_id, vendors(user_id), products(name_en)')
    .eq('id', id)
    .single()

  if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  if (!conversation.product_id) {
    return NextResponse.json({ error: 'Conversation has no associated product' }, { status: 400 })
  }

  // Expire any previous pending offers so only one is active at a time
  await admin
    .from('bargain_offers')
    .update({ status: 'expired' })
    .eq('conversation_id', id)
    .eq('status', 'pending')

  // Create new bargain offer
  const { data: offer, error } = await admin
    .from('bargain_offers')
    .insert({
      conversation_id: id,
      buyer_id:        conversation.buyer_id,
      vendor_id:       conversation.vendor_id,
      product_id:      conversation.product_id,   
      offered_price:   price,
      offered_by:      user.id,
      status:          'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Insert message marker for the offer
  const { data: message, error: msgError } = await admin
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

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 })

  // Update conversation timestamp
  await admin.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', id)


// Get buyer's user_id from the conversation before sending:
const { data: conv } = await admin
  .from('conversations')
  .select('buyer_id')
  .eq('id', id)
  .single()

if (conv?.buyer_id) {
  await sendPushToUser(conv.buyer_id, {
    title: 'New Offer',
    body:  `You received an offer of ${price.toLocaleString('en-US')} XAF.`,
    url:   `/chat/${id}`,
  })
}

  return NextResponse.json({ offer, message }, { status: 201 })
}