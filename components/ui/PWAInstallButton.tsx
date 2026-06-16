'use client'

import { useState, useEffect } from 'react'
import { Download, CheckCircle2 } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallButton({ compact = false }: { compact?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled]           = useState(false)
  const [isStandalone, setIsStandalone]     = useState(false)

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (isStandalone) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2.5">
        <CheckCircle2 size={15} className="text-success" />
        <span className="text-[13px] text-success">App installed on this device</span>
      </div>
    )
  }

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt (Safari)
      alert('To install: tap the Share button in your browser, then "Add to Home Screen"')
      return
    }
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setDeferredPrompt(null)
  }

  if (installed) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2.5">
        <CheckCircle2 size={15} className="text-success" />
        <span className="text-[13px] text-success">Installing… check your home screen</span>
      </div>
    )
  }

  if (compact) {
    return (
      <button
        onClick={handleInstall}
        className="flex h-10 items-center gap-2 rounded-xl border border-primary px-4 text-[13px] font-semibold text-primary"
      >
        <Download size={14} />
        Install App
      </button>
    )
  }

  return (
    <button
      onClick={handleInstall}
      className="flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
        <span className="font-syne text-[16px] font-extrabold text-primary-foreground">L</span>
      </div>
      <div className="flex-1">
        <p className="text-[14px] font-semibold text-foreground">Install LOKA App</p>
        <p className="text-[12px] text-muted-foreground">Add to your home screen for faster access</p>
      </div>
      <Download size={18} className="shrink-0 text-primary" />
    </button>
  )
}