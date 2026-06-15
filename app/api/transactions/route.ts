import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { initiatePayment, formatPhone } from '@/lib/utils/fapshi'

const LOKA_FEE_RATE = 0.02 // 2% escrow fee

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  // Get buyer profile (for phone fallback)
  const { data: profile } = await admin
    .from('users')
    .select('role, phone, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const {
    product_id,
    bargain_offer_id,
    agreed_price,
    phone: requestPhone,
  } = body as {
    product_id:        string
    bargain_offer_id?: string
    agreed_price?:     number
    phone?:            string
  }

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  }

  // Fetch product
  const { data: product } = await admin
    .from('products')
    .select('id, vendor_id, name_en, price, is_published')
    .eq('id', product_id)
    .single()

  if (!product || !product.is_published) {
    return NextResponse.json({ error: 'Product not found or no longer available' }, { status: 404 })
  }

  // Prevent vendor buying their own product
  const { data: ownVendor } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (ownVendor && ownVendor.id === product.vendor_id) {
    return NextResponse.json({ error: 'Cannot purchase your own product' }, { status: 400 })
  }

  // Determine price
  let finalPrice: number
  if (agreed_price && Number.isInteger(agreed_price) && agreed_price > 0) {
    finalPrice = agreed_price

    // If a bargain_offer_id is provided, verify it is accepted
    if (bargain_offer_id) {
      const { data: offer } = await admin
        .from('bargain_offers')
        .select('status, offered_price')
        .eq('id', bargain_offer_id)
        .single()
      if (!offer || offer.status !== 'accepted') {
        return NextResponse.json({ error: 'Bargain offer is not accepted' }, { status: 400 })
      }
    }
  } else {
    finalPrice = product.price
  }

  const lokaFee      = Math.round(finalPrice * LOKA_FEE_RATE)
  const totalCharged = finalPrice + lokaFee

  // Resolve phone number
  const rawPhone   = requestPhone ?? profile.phone
  if (!rawPhone) {
    return NextResponse.json(
      { error: 'Phone number required — provide it in the request or ensure your profile has one' },
      { status: 400 }
    )
  }
  const buyerPhone = formatPhone(rawPhone)

  // Check for existing active transaction
  const { data: existingTx } = await admin
    .from('transactions')
    .select('id, status')
    .eq('buyer_id', user.id)
    .eq('product_id', product_id)
    .in('status', ['pending', 'funded'])
    .maybeSingle()

  if (existingTx) {
    return NextResponse.json(
      { error: 'You already have an active transaction for this product', transactionId: existingTx.id },
      { status: 409 }
    )
  }

  // Create transaction in DB first so we have the UUID for Fapshi
  const { data: transaction, error: txError } = await admin
    .from('transactions')
    .insert({
      buyer_id:         user.id,
      vendor_id:        product.vendor_id,
      product_id:       product.id,
      bargain_offer_id: bargain_offer_id ?? null,
      agreed_price:     finalPrice,
      loka_fee:         lokaFee,
      total_charged:    totalCharged,
      status:           'pending',
      payment_method:   'mtn_momo',
    })
    .select('id')
    .single()

  if (txError || !transaction) {
    console.error('[POST /api/transactions] Insert error:', txError?.message)
    return NextResponse.json({ error: txError?.message ?? 'Failed to create transaction' }, { status: 500 })
  }

  // Call Fapshi with our transaction UUID as externalId
  try {
    const fapshi = await initiatePayment({
      amount:      totalCharged,
      phone:       buyerPhone,
      externalId:  transaction.id,
      message:     `Payment for ${product.name_en} via LOKA`,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${product_id}?txn=${transaction.id}`,
    })

    // Store Fapshi transId
    await admin
      .from('transactions')
      .update({ fapshi_reference: fapshi.data.transId })
      .eq('id', transaction.id)

    return NextResponse.json({
      transactionId:  transaction.id,
      fapshiTransId:  fapshi.data.transId,
      paymentLink:    fapshi.data.link,
      totalCharged,
      agreedPrice:    finalPrice,
      lokaFee,
      message:        `MTN MoMo USSD prompt sent to ${buyerPhone}. Approve on your handset.`,
    }, { status: 201 })

  } catch (fapshiErr) {
    // Roll back — delete the pending transaction
    await admin.from('transactions').delete().eq('id', transaction.id)

    const msg = fapshiErr instanceof Error ? fapshiErr.message : 'Payment initiation failed'
    console.error('[POST /api/transactions] Fapshi error:', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}