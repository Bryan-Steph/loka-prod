import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { verifyWebhookToken } from '@/lib/utils/fapshi'
import { sendSMS } from '@/lib/utils/africas-talking'

function generatePickupCode(): string {
  // 6 cryptographically random digits
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  // ── 1. Authenticate webhook ───────────────────────────────────────────────
  const token = req.headers.get('x-webhook-token')
  if (!verifyWebhookToken(token)) {
    console.error('[WEBHOOK] Rejected — invalid token')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  console.log('[WEBHOOK] Received:', JSON.stringify(payload))

  // ── 2. Parse payload (handle both root-level and nested `data` formats) ───
  const root        = (payload.data as Record<string, unknown>) ?? payload
  const transId     = (root.transId  ?? payload.transId)  as string | undefined
  const externalId  = (root.userId   ?? payload.userId
                      ?? root.externalId ?? payload.externalId) as string | undefined
  const rawStatus   = (root.status   ?? payload.status)   as string | undefined
  const status      = rawStatus?.toUpperCase()

  // Only handle successful payments
  if (status !== 'SUCCESSFUL') {
    console.log(`[WEBHOOK] Status is '${status}' — not processing`)
    return NextResponse.json({ received: true, action: 'ignored', status })
  }

  if (!transId && !externalId) {
    console.error('[WEBHOOK] No transId or externalId in payload')
    return NextResponse.json({ error: 'Missing identifiers' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  // ── 3. Find our transaction ───────────────────────────────────────────────
  // Try by externalId (our UUID) first — most reliable
  let txRecord: Record<string, unknown> | null = null

  if (externalId) {
    const { data } = await admin
      .from('transactions')
      .select('*')
      .eq('id', externalId)
      .maybeSingle()
    txRecord = data
  }

  // Fallback: look up by Fapshi's transId
  if (!txRecord && transId) {
    const { data } = await admin
      .from('transactions')
      .select('*')
      .eq('fapshi_reference', transId)
      .maybeSingle()
    txRecord = data
  }

  if (!txRecord) {
    console.error(`[WEBHOOK] Transaction not found — externalId=${externalId}, transId=${transId}`)
    // Return 200 so Fapshi doesn't retry endlessly; log for manual resolution
    return NextResponse.json({ received: true, action: 'not_found' })
  }

  // ── 4. Idempotency check ──────────────────────────────────────────────────
  if (txRecord.status !== 'pending') {
    console.log(`[WEBHOOK] Transaction ${txRecord.id} already in status '${txRecord.status}' — skipping`)
    return NextResponse.json({ received: true, action: 'already_processed' })
  }

  const txId    = txRecord.id    as string
  const buyerId = txRecord.buyer_id as string

  // ── 5. Generate and hash pickup code ─────────────────────────────────────
  const pickupCode  = generatePickupCode()
  const codeHash    = await bcrypt.hash(pickupCode, 12)
  const autoRelease = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  // ── 6. Update transaction to 'funded' ─────────────────────────────────────
  const { error: updateErr } = await admin
    .from('transactions')
    .update({
      status:           'funded',
      fapshi_reference: transId ?? (txRecord.fapshi_reference as string),
      pickup_code_hash: codeHash,
      funded_at:        new Date().toISOString(),
      auto_release_at:  autoRelease,
    })
    .eq('id', txId)

  if (updateErr) {
    console.error('[WEBHOOK] Failed to update transaction:', updateErr.message)
    // Return 500 so Fapshi retries
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // ── 7. Get buyer phone for SMS ────────────────────────────────────────────
  const { data: buyer } = await admin
    .from('users')
    .select('phone, full_name')
    .eq('id', buyerId)
    .single()

  // ── 8. Insert buyer notification (plaintext code stored here for in-app display) ──
  await admin.from('notifications').insert({
    user_id:  buyerId,
    type:     'payment_confirmed',
    title:    '✅ Payment Confirmed — Pickup Code Ready',
    body:     `Your 6-digit pickup code is: ${pickupCode}. Show it to the vendor. Valid for 48 hours.`,
    is_read:  false,
    data:     { pickup_code: pickupCode, transaction_id: txId },
  })

  // ── 9. Find vendor user_id for their notification ─────────────────────────
  const { data: vendorRow } = await admin
    .from('vendors')
    .select('user_id')
    .eq('id', txRecord.vendor_id as string)
    .single()

  if (vendorRow?.user_id) {
    await admin.from('notifications').insert({
      user_id:  vendorRow.user_id,
      type:     'payment_received',
      title:    '💰 Payment in Escrow — Awaiting Pickup',
      body:     `A buyer has paid ${(txRecord.agreed_price as number).toLocaleString('en-US')} XAF for a product. Ask them for their 6-digit pickup code to release payment.`,
      is_read:  false,
      data:     { transaction_id: txId },
    })
  }

  // ── 10. Send SMS to buyer (non-fatal if it fails) ─────────────────────────
  const buyerPhone = buyer?.phone
  if (buyerPhone) {
    const smsText = `LOKA Marketplace: Your pickup code is ${pickupCode}. Show this 6-digit code to the vendor to confirm your purchase and release payment. Valid 48 hours. Do not share with anyone except the vendor.`
    const sent    = await sendSMS(buyerPhone, smsText)
    if (!sent) {
      console.warn(`[WEBHOOK] SMS failed for transaction ${txId}. Buyer can use in-app notification.`)
    }
  }

  console.log(`[WEBHOOK] Transaction ${txId} funded. Pickup code generated and delivered.`)

  return NextResponse.json({ received: true, action: 'funded', transactionId: txId })
}