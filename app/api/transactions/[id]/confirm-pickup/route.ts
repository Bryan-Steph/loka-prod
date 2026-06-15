import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { disburseToVendor, formatPhone } from '@/lib/utils/fapshi'

const MAX_ATTEMPTS = 5

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { entered_code } = await req.json()
  const code = String(entered_code ?? '').trim()
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'A 6-digit numeric pickup code is required' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  // Verify caller is a vendor
  const { data: callerVendor } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!callerVendor) {
    return NextResponse.json({ error: 'Only vendors can confirm pickup' }, { status: 403 })
  }

  // Fetch transaction — vendor_id must match
  const { data: tx, error: txErr } = await admin
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('vendor_id', callerVendor.id)
    .single()

  if (txErr || !tx) {
    return NextResponse.json({ error: 'Transaction not found or you are not the vendor' }, { status: 404 })
  }

  // Status gate
  if (tx.status !== 'funded') {
    const messages: Record<string, string> = {
      pending:   'Payment not yet confirmed by Fapshi',
      confirmed: 'Pickup already confirmed',
      released:  'Payment already released',
      disputed:  'This transaction is under dispute — contact LOKA support',
      refunded:  'This transaction has been refunded',
      expired:   'This transaction has expired',
    }
    return NextResponse.json(
      { error: messages[tx.status as string] ?? `Invalid status: ${tx.status}` },
      { status: 409 }
    )
  }

  const attempts = (tx.pickup_attempts as number) ?? 0

  // Max attempts exceeded
  if (attempts >= MAX_ATTEMPTS) {
    await admin.from('transactions').update({ status: 'expired' }).eq('id', id)
    return NextResponse.json(
      { error: 'Maximum pickup attempts exceeded. Transaction expired.' },
      { status: 403 }
    )
  }

  // ── Verify code ───────────────────────────────────────────────────────────
  const isCorrect = await bcrypt.compare(code, tx.pickup_code_hash as string)

  if (!isCorrect) {
    const newAttempts = attempts + 1
    const isLastAttempt = newAttempts >= MAX_ATTEMPTS

    await admin
      .from('transactions')
      .update({
        pickup_attempts: newAttempts,
        ...(isLastAttempt ? { status: 'expired' } : {}),
      })
      .eq('id', id)

    if (isLastAttempt) {
      return NextResponse.json(
        { error: 'Maximum attempts reached. Transaction expired. Contact LOKA support.' },
        { status: 403 }
      )
    }

    const remaining = MAX_ATTEMPTS - newAttempts
    return NextResponse.json(
      { error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` },
      { status: 422 }
    )
  }

  // ── Code is correct ───────────────────────────────────────────────────────
  await admin
    .from('transactions')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', id)

  // ── Disburse to vendor ────────────────────────────────────────────────────
  const { data: vendorUser } = await admin
    .from('users')
    .select('phone, full_name')
    .eq('id', user.id)
    .single()

  let disbursed   = false
  let releaseErr  = ''

  if (vendorUser?.phone) {
    try {
      await disburseToVendor({
        amount:     tx.agreed_price as number,
        phone:      formatPhone(vendorUser.phone),
        name:       vendorUser.full_name ?? 'LOKA Vendor',
        externalId: `disburse-${id}`,
      })

      disbursed = true

      await admin
        .from('transactions')
        .update({ status: 'released', released_at: new Date().toISOString() })
        .eq('id', id)

    } catch (err) {
      releaseErr = err instanceof Error ? err.message : 'Disbursement failed'
      console.error('[CONFIRM-PICKUP] Fapshi disbursement error:', releaseErr)
      // Transaction stays as 'confirmed' — cron will retry or admin resolves
    }
  } else {
    console.warn('[CONFIRM-PICKUP] Vendor has no phone number on file — disbursement skipped')
  }

  // ── Notify both parties ───────────────────────────────────────────────────
  const agreedPrice = (tx.agreed_price as number).toLocaleString('en-US')

  await admin.from('notifications').insert({
    user_id:  tx.buyer_id as string,
    type:     'pickup_confirmed',
    title:    '✅ Pickup Confirmed',
    body:     `Your purchase has been confirmed. Enjoy your item!`,
    is_read:  false,
    data:     { transaction_id: id },
  })

  await admin.from('notifications').insert({
    user_id:  user.id,
    type:     disbursed ? 'payment_released' : 'payment_pending_release',
    title:    disbursed ? '💰 Payment Released!' : '✅ Code Verified',
    body:     disbursed
      ? `${agreedPrice} XAF has been sent to your MTN MoMo.`
      : `Pickup confirmed. Your payment of ${agreedPrice} XAF is being processed.`,
    is_read:  false,
    data:     { transaction_id: id },
  })

  return NextResponse.json({
    success:   true,
    disbursed,
    status:    disbursed ? 'released' : 'confirmed',
    message:   disbursed
      ? `${agreedPrice} XAF released to your MoMo!`
      : 'Pickup confirmed. Payment is being processed.',
    ...(releaseErr ? { warning: releaseErr } : {}),
  })
}