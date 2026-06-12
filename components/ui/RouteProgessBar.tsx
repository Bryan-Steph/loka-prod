'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const STEPS = [
  { progress: 35, delay: 80 },
  { progress: 65, delay: 300 },
  { progress: 85, delay: 900 },
]
const MAX_DURATION = 6000 // safety: auto-hide even if navigation never completes

export function RouteProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timers = useRef<number[]>([])
  const lastKey = useRef<string | null>(null)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const start = () => {
    clearTimers()
    setVisible(true)
    setProgress(8)
    STEPS.forEach(({ progress: p, delay }) => {
      timers.current.push(window.setTimeout(() => setProgress(p), delay))
    })
    timers.current.push(
      window.setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, MAX_DURATION),
    )
  }

  const finish = () => {
    clearTimers()
    setProgress(100)
    timers.current.push(
      window.setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 200),
    )
  }

  // Fire on any internal <Link> click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as HTMLElement)?.closest('a')
      if (!anchor || anchor.target === '_blank') return

      let url: URL
      try {
        url = new URL(anchor.href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return

      start()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Complete when the route actually changes
  useEffect(() => {
    const key = `${pathname}?${searchParams.toString()}`
    if (lastKey.current === null) {
      lastKey.current = key
      return
    }
    if (lastKey.current !== key) {
      lastKey.current = key
      finish()
    }
  }, [pathname, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-[3px] bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-primary shadow-[0_0_10px_rgba(245,158,11,0.7)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}