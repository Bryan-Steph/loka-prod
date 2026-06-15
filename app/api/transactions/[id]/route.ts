import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  const { data: transaction, error } = await admin
    .from('transactions')
    .select(`
      *,
      products(id, name_en, price, photo_urls),
      vendors(id, shop_name, address_text, user_id)
    `)
    .eq('id', id)
    .single()

  if (error || !transaction) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  }

  const isBuyer = transaction.buyer_id === user.id

  // Check vendor ownership
  const vendorData = transaction.vendors as Record<string, unknown> | null
  const isVendor   = vendorData?.user_id === user.id

  if (!isBuyer && !isVendor) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── Securely return pickup code for buyer when funded/confirmed ────────────
  // The plaintext code is NOT in the transactions table (only the hash).
  // It is stored in the buyer's notification data JSON at generation time.
  let pickupCode: string | null = null

  if (isBuyer && ['funded', 'confirmed'].includes(transaction.status as string)) {
    const { data: notification } = await admin
      .from('notifications')
      .select('data')
      .eq('user_id', user.id)
      .eq('type', 'payment_confirmed')
      .contains('data', { transaction_id: id })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (notification?.data) {
      const nd = notification.data as Record<string, unknown>
      pickupCode = (nd.pickup_code as string) ?? null
    }
  }

  // Strip the hash — never expose it to the client
  const { pickup_code_hash: _, ...safeTransaction } = transaction as typeof transaction & { pickup_code_hash: unknown }

  return NextResponse.json({
    transaction:     safeTransaction,
    pickup_code:     pickupCode,
    role:            isVendor ? 'vendor' : 'buyer',
    pickup_attempts: (transaction.pickup_attempts as number) ?? 0,
  })
}