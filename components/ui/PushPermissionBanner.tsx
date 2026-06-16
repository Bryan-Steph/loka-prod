'use client'

import { useState, useEffect } from 'react'
import { Bell, X, CheckCircle2 } from 'lucide-react'

const DISMISSED_KEY = 'loka:push-banner-hidden-until'

function urlBase64ToUint8Array(b64: string): Uint8Array {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4)
  const base64  = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export function PushPermissionBanner() {
  const [show, setShow]           = useState(false)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)

  useEffect(() => {
    // Only show on mobile
    if (!window.matchMedia('(max-width: 768px)').matches) return
    // Must have SW + Push support
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    // Already granted or denied
    if (Notification.permission !== 'default') return
    // Respect 7-day dismiss
    const until = localStorage.getItem(DISMISSED_KEY)
    if (until && Date.now() < Number(until)) return

    // Delay 3 s so the user has settled on the page before we interrupt
    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleAllow = async () => {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        // User declined via the browser dialog — hide banner
        setShow(false)
        return
      }

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ).buffer as ArrayBuffer,
      })

      const res = await fetch('/api/push/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription: sub.toJSON() }),
      })

      if (res.ok) {
        setDone(true)
        setTimeout(() => setShow(false), 1800)
      } else {
        setShow(false)
      }
    } catch (err) {
      console.error('[push banner]', err)
      setShow(false)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    // Hide for 7 days
    localStorage.setItem(
      DISMISSED_KEY,
      String(Date.now() + 7 * 24 * 60 * 60 * 1000),
    )
    setShow(false)
  }

  if (!show) return null

  return (
    // Sit above the bottom nav (bottom-20 ≈ 80 px)
    <div className="fixed inset-x-0 bottom-20 z-50 px-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4 shadow-xl">
        {done ? (
          /* Success state */
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 size={18} className="text-success" />
            </div>
            <p className="text-[13px] font-medium text-foreground">
              Notifications enabled!
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Bell size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-foreground">
                  Stay updated
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  Get notified when a vendor accepts your offer or your pickup code is ready.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="shrink-0 text-muted-foreground"
                aria-label="Dismiss"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 rounded-xl border border-surface-3 py-2.5 text-[13px] text-muted-foreground"
              >
                Not now
              </button>
              <button
                onClick={handleAllow}
                disabled={loading}
                className="flex flex-1 items-center justify-center rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-70"
              >
                {loading ? 'Enabling…' : 'Allow notifications'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}