import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { assertParticipant } from '../../../_lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; offerId: string }> },   // ← both id AND offerId
) {
  const { id, offerId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, counter_price } = await req.json()
  if (!['accept', 'counter', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'action must be accept, counter, or decline' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()
  const participant = await assertParticipant(admin, id, user.id)
  if (!participant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: offer } = await admin
    .from('bargain_offers')
    .select('*')
    .eq('id', offerId)
    .eq('conversation_id', id)
    .single()

  if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })

  if (offer.status !== 'pending') {
    return NextResponse.json({ error: 'This offer is no longer active' }, { status: 409 })
  }

  if (offer.offered_by === user.id) {
    return NextResponse.json(
      { error: 'Waiting for the other party to respond to your offer' },
      { status: 400 }
    )
  }

  if (action === 'decline') {
    await admin.from('bargain_offers').update({ status: 'declined' }).eq('id', offerId)
    await admin.from('messages').insert({
      conversation_id: id,
      sender_id:       user.id,
      content:         `Offer of ${offer.offered_price.toLocaleString('en-US')} XAF was declined`,
      message_type:    'system',
      is_read:         false,
    })
    await admin.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', id)
    return NextResponse.json({ status: 'declined' })
  }

  if (action === 'accept') {
    await admin.from('bargain_offers').update({ status: 'accepted' }).eq('id', offerId)
    await admin.from('messages').insert({
      conversation_id: id,
      sender_id:       user.id,
      content:         `Offer of ${offer.offered_price.toLocaleString('en-US')} XAF was accepted — proceed to payment`,
      message_type:    'system',
      offer_id:        offerId,
      is_read:         false,
    })
    await admin.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', id)
    return NextResponse.json({ status: 'accepted' })
  }

  // action === 'counter'
  const price = Number(counter_price)
  if (!Number.isInteger(price) || price <= 0) {
    return NextResponse.json(
      { error: 'counter_price must be a positive whole number (XAF)' },
      { status: 400 }
    )
  }

  await admin.from('bargain_offers').update({ status: 'countered' }).eq('id', offerId)

// In the action === 'counter' branch — get product_id from conversation
  const { data: conversation } = await admin
    .from('conversations')
    .select('buyer_id, vendor_id, product_id')
    .eq('id', id)
    .single()

  const { data: newOffer, error } = await admin
    .from('bargain_offers')
    .insert({
      conversation_id: id,
      buyer_id:        conversation!.buyer_id,
      vendor_id:       conversation!.vendor_id,
      product_id:      conversation!.product_id,   // ← ADD THIS
      offered_price:   price,
      offered_by:      user.id,
      status:          'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('messages').insert({
    conversation_id: id,
    sender_id:       user.id,
    content:         `Counter-offer: ${price.toLocaleString('en-US')} XAF`,
    message_type:    'offer',
    offer_id:        newOffer.id,
    is_read:         false,
  })
  await admin.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', id)
  return NextResponse.json({ status: 'countered', offer: newOffer })
}