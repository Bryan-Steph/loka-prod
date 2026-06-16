import webpush from 'web-push'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

// ---------------------------------------------------------------------------
// VAPID configuration — graceful no-op when keys are missing (local dev
// without push support, CI, etc.). Real pushes only fire in production.
// ---------------------------------------------------------------------------
const configured =
  !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  !!process.env.VAPID_PRIVATE_KEY &&
  !!process.env.VAPID_SUBJECT

if (configured) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  )
}

export interface PushPayload {
  title: string
  body:  string
  url?:  string   // opened when the user taps the notification
  icon?: string   // defaults to /icons/icon-192.png in sw.js
}

/**
 * Send a Web Push notification to every active subscription for a user.
 * Safe to call from any server-side context (API routes, server actions,
 * webhook handlers). Expired subscriptions are cleaned up automatically.
 *
 * @example
 * await sendPushToUser(vendorUserId, {
 *   title: 'New Bargain Offer',
 *   body:  'Someone offered 45,000 XAF for "Samsung Galaxy A32"',
 *   url:   `/chat/${conversationId}`,
 * })
 */
export async function sendPushToUser(
  userId:  string,
  payload: PushPayload,
): Promise<void> {
  if (!configured) {
    console.warn('[push] VAPID keys not set — skipping notification for', userId)
    return
  }

  const admin = createAdminSupabaseClient()

  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('endpoint, keys')
    .eq('user_id', userId)

  if (error) { console.error('[push] DB read error', error.message); return }
  if (!subs?.length) return   // user has no push subscriptions — silent exit

  const message = JSON.stringify(payload)

  // Fire all subscriptions concurrently; collect results so one failure
  // (expired subscription, network issue) doesn't block the others.
  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys as { p256dh: string; auth: string },
          },
          message,
          { TTL: 60 * 60 * 24 },   // hold for 24 h if device is offline
        )
      } catch (err: any) {
        // 410 Gone / 404 = subscription expired or revoked by the browser.
        // Clean it up so we don't keep hitting a dead endpoint.
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await admin
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
          console.info('[push] removed stale subscription', sub.endpoint.slice(-20))
        } else {
          console.error('[push] send error', err?.statusCode, err?.message)
        }
      }
    }),
  )

  const sent    = results.filter((r) => r.status === 'fulfilled').length
  const failed  = results.length - sent
  if (failed > 0) {
    console.warn(`[push] ${sent} sent, ${failed} failed for user`, userId)
  }
}