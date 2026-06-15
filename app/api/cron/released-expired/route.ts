import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { disburseToVendor, formatPhone } from '@/lib/utils/fapshi'

// Called by Vercel Cron every 15 minutes.
// Finds all funded transactions past their 48-hour window and auto-releases them.

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminSupabaseClient()

  const { data: expired, error } = await admin
    .from('transactions')
    .select(`
      *,
      vendors!vendor_id(id, user_id),
      users!buyer_id(phone)
    `)
    .eq('status', 'funded')
    .lt('auto_release_at', new Date().toISOString())
    .limit(50) // process in batches

  if (error) {
    console.error('[CRON] Query error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!expired?.length) {
    return NextResponse.json({ released: 0, message: 'No expired transactions' })
  }

  const results: { id: string; status: 'released' | 'failed'; error?: string }[] = []

  for (const tx of expired) {
    try {
      const vendor     = tx.vendors as Record<string, unknown> | null
      const vendorUid  = vendor?.user_id as string | null

      // Get vendor's phone
      let vendorPhone: string | null = null
      let vendorName  = 'LOKA Vendor'
      if (vendorUid) {
        const { data: vendorUser } = await admin
          .from('users')
          .select('phone, full_name')
          .eq('id', vendorUid)
          .single()
        vendorPhone = vendorUser?.phone ?? null
        vendorName  = vendorUser?.full_name ?? 'LOKA Vendor'
      }

      if (vendorPhone) {
        await disburseToVendor({
          amount:     tx.agreed_price as number,
          phone:      formatPhone(vendorPhone),
          name:       vendorName,
          externalId: `auto-release-${tx.id}`,
        })
      }

      await admin
        .from('transactions')
        .update({
          status:      'released',
          released_at: new Date().toISOString(),
          admin_note:  'Auto-released: 48-hour dispute window expired',
        })
        .eq('id', tx.id)

      const price = (tx.agreed_price as number).toLocaleString('en-US')

      // Notify buyer
      await admin.from('notifications').insert({
        user_id:  tx.buyer_id as string,
        type:     'payment_auto_released',
        title:    '💰 Payment Auto-Released',
        body:     'Your 48-hour dispute window has passed. Payment has been released to the vendor.',
        is_read:  false,
        data:     { transaction_id: tx.id },
      })

      // Notify vendor
      if (vendorUid) {
        await admin.from('notifications').insert({
          user_id:  vendorUid,
          type:     'payment_released',
          title:    '💰 Payment Released',
          body:     `${price} XAF has been sent to your MTN MoMo (auto-released after 48h).`,
          is_read:  false,
          data:     { transaction_id: tx.id },
        })
      }

      results.push({ id: tx.id, status: 'released' })
      console.log(`[CRON] Auto-released transaction ${tx.id}`)

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[CRON] Failed to release ${tx.id}:`, msg)
      results.push({ id: tx.id, status: 'failed', error: msg })
    }
  }

  const released = results.filter(r => r.status === 'released').length
  console.log(`[CRON] Processed ${expired.length} expired transactions. Released: ${released}`)

  return NextResponse.json({ processed: expired.length, released, results })
}