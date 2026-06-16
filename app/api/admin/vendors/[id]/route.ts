import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/admin/assertAdmin'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const ctx = await assertAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { admin, userId } = ctx

  let body: { action: string; reason?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { action, reason } = body

  if (!['approve', 'reject', 'suspend'].includes(action)) {
    return NextResponse.json({ error: 'action must be approve, reject, or suspend' }, { status: 400 })
  }

  const STATUS_MAP: Record<string, string> = {
    approve: 'approved',
    reject:  'rejected',
    suspend: 'suspended',
  }

  const updates: Record<string, unknown> = {
    verification_status: STATUS_MAP[action],
  }

  if (action === 'approve') {
    updates.verified_at       = new Date().toISOString()
    updates.verified_by       = userId
    updates.is_active         = true
    updates.suspension_reason = null
  }

  if (action === 'reject' || action === 'suspend') {
    updates.is_active         = false
    updates.suspension_reason = reason?.trim() ?? null
    if (action === 'reject') updates.verified_at = null
  }

  const { data: vendor, error } = await admin
    .from('vendors')
    .update(updates)
    .eq('id', id)
    .select('id, shop_name, verification_status, user_id')
    .single()

  if (error || !vendor) {
    return NextResponse.json({ error: error?.message ?? 'Vendor not found' }, { status: 500 })
  }

  // Notify the vendor
  const notifConfig: Record<string, { type: string; title: string; body: string }> = {
    approve: {
      type:  'vendor_approved',
      title: 'Shop Approved — You\'re Live!',
      body:  'Congratulations! Your LOKA shop is now live. Buyers can find and purchase your products in the marketplace.',
    },
    reject: {
      type:  'vendor_rejected',
      title: ' Verification Not Approved',
      body:  reason?.trim()
        ? `Your verification was not approved. Reason: ${reason.trim()}. Please resubmit with clearer documentation.`
        : 'Your verification was not approved. Please resubmit with clearer documentation.',
    },
    suspend: {
      type:  'vendor_suspended',
      title: ' Account Suspended',
      body:  reason?.trim()
        ? `Your vendor account has been suspended. Reason: ${reason.trim()}. Contact LOKA support to appeal.`
        : 'Your vendor account has been suspended. Contact LOKA support to appeal.',
    },
  }

  const notif = notifConfig[action]

  await admin.from('notifications').insert({
    user_id:  vendor.user_id,
    type:     notif.type as string,
    title:    notif.title,
    body:     notif.body,
    is_read:  false,
    data:     { vendor_id: id, action },
  }).then(({ error: nErr }) => {
    if (nErr) console.error('[ADMIN PATCH] Notification insert error:', nErr.message)
  })

  return NextResponse.json({ vendor })
}