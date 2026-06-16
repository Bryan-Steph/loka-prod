'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

const DISMISSED_KEY = 'loka:pwa-install-hidden-until'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow]                     = useState(false)
  const [installing, setInstalling]         = useState(false)

  useEffect(() => {
    // Mobile only
    if (!window.matchMedia('(max-width: 768px)').matches) return
    // Already installed as standalone
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Respect 7-day dismiss
    const until = localStorage.getItem(DISMISSED_KEY)
    if (until && Date.now() < Number(until)) return

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show the banner 5 s after the browser fires the event
      setTimeout(() => setShow(true), 5000)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setShow(false)
    } finally {
      setInstalling(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem(
      DISMISSED_KEY,
      String(Date.now() + 7 * 24 * 60 * 60 * 1000),
    )
    setShow(false)
  }

  if (!show || !deferredPrompt) return null

  return (
    <div className="fixed inset-x-0 bottom-20 z-50 px-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4 shadow-xl">
        <div className="flex items-start gap-3">
          {/* Mini app icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary">
            <span className="font-syne text-[18px] font-extrabold text-primary-foreground">
              L
            </span>
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-foreground">
              Add LOKA to your home screen
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Faster access, full-screen experience, works offline.
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
            onClick={handleInstall}
            disabled={installing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-70"
          >
            <Download size={15} />
            {installing ? 'Installing…' : 'Install app'}
          </button>
        </div>
      </div>
    </div>
  )
}