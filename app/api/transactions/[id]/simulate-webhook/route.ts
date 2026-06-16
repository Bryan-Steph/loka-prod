import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { PAYMENT_SIMULATION_MODE } from '@/lib/utils/fapshi'
import { sendSMS } from '@/lib/utils/africas-talking'

function generatePickupCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!PAYMENT_SIMULATION_MODE) {
    return NextResponse.json({ error: 'Simulation mode is disabled' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  const { data: tx } = await admin.from('transactions').select('*').eq('id', id).single()
  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  if (tx.buyer_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (tx.status !== 'pending') {
    return NextResponse.json({ received: true, action: 'already_processed', status: tx.status })
  }

  const pickupCode  = generatePickupCode()
  const codeHash    = await bcrypt.hash(pickupCode, 12)
  const autoRelease = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  await admin.from('transactions').update({
    status: 'funded',
    fapshi_reference: tx.fapshi_reference ?? `SIM-${id.slice(0, 8)}`,
    pickup_code_hash: codeHash,
    funded_at: new Date().toISOString(),
    auto_release_at: autoRelease,
  }).eq('id', id)

  const { data: buyer } = await admin.from('users').select('phone, full_name').eq('id', user.id).single()

  await admin.from('notifications').insert({
    user_id: user.id,
    type: 'payment_confirmed',
    title: '✅ Payment Confirmed — Pickup Code Ready',
    body: `Your 6-digit pickup code is: ${pickupCode}. Show it to the vendor. Valid for 48 hours.`,
    is_read: false,
    data: { pickup_code: pickupCode, transaction_id: id },
  })

  const { data: vendorRow } = await admin.from('vendors').select('user_id').eq('id', tx.vendor_id as string).single()
  if (vendorRow?.user_id) {
    await admin.from('notifications').insert({
      user_id: vendorRow.user_id,
      type: 'payment_received',
      title: '💰 Payment in Escrow — Awaiting Pickup',
      body: `A buyer has paid ${(tx.agreed_price as number).toLocaleString('en-US')} XAF. Ask for their 6-digit pickup code to release payment.`,
      is_read: false,
      data: { transaction_id: id },
    })
  }

  if (buyer?.phone) {
    const smsText = `LOKA Marketplace: Your pickup code is ${pickupCode}. Show this to the vendor. Valid 48 hours.`
    sendSMS(buyer.phone, smsText).catch(() => {})
  }

  return NextResponse.json({ received: true, action: 'funded', pickup_code: pickupCode })
}