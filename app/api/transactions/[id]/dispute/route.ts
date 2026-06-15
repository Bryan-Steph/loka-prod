import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { reason } = await req.json()
  if (!String(reason ?? '').trim()) {
    return NextResponse.json({ error: 'A reason is required to raise a dispute' }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  const { data: tx, error } = await admin
    .from('transactions')
    .select('*, vendors(user_id)')
    .eq('id', id)
    .single()

  if (error || !tx) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  const isBuyer  = tx.buyer_id === user.id
  const vendor   = tx.vendors as Record<string, unknown> | null
  const isVendor = vendor?.user_id === user.id

  if (!isBuyer && !isVendor) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Can only dispute funded transactions
  if (tx.status !== 'funded') {
    return NextResponse.json(
      { error: `Cannot dispute a transaction with status: ${tx.status}` },
      { status: 409 }
    )
  }

  await admin
    .from('transactions')
    .update({ status: 'disputed', dispute_reason: reason.trim() })
    .eq('id', id)

  // Notify the other party
  if (isBuyer && vendor?.user_id) {
    await admin.from('notifications').insert({
      user_id:  vendor.user_id as string,
      type:     'dispute_raised',
      title:    '⚠️ Dispute Raised',
      body:     `A buyer has raised a dispute: "${reason.trim()}". LOKA support will contact you within 24 hours.`,
      is_read:  false,
      data:     { transaction_id: id },
    })
  } else if (isVendor) {
    await admin.from('notifications').insert({
      user_id:  tx.buyer_id as string,
      type:     'dispute_raised',
      title:    '⚠️ Dispute Raised',
      body:     `A dispute has been raised for your transaction: "${reason.trim()}". LOKA support will contact you within 24 hours.`,
      is_read:  false,
      data:     { transaction_id: id },
    })
  }

  return NextResponse.json({ success: true, status: 'disputed' })
}