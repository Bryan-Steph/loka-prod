'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { X, Maximize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
  ssr:     false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center font-mono text-[10px] text-muted-foreground">
      Loading map…
    </div>
  ),
})

interface VendorMapProps {
  lat: number
  lng: number
  label?: string
  className?: string
  enlargeable?: boolean
}

export function VendorMap({
  lat, lng, label, className, enlargeable = true,
}: VendorMapProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => enlargeable && setOpen(true)}
        className={cn(
          'relative block overflow-hidden rounded-xl border border-surface-3',
          className,
        )}
        aria-label={enlargeable ? 'Open full map' : undefined}
      >
        <LeafletMapInner lat={lat} lng={lng} label={label} interactive={false} />
        {enlargeable && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 font-mono text-[9px] text-foreground backdrop-blur">
            <Maximize2 size={10} />
            Expand
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-background">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-3 px-4">
            <span className="font-syne text-[15px] font-bold text-foreground">
              {label ?? 'Shed Location'}
            </span>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-foreground">
              <X size={22} />
            </button>
          </div>
          <div className="flex-1">
            <LeafletMapInner lat={lat} lng={lng} label={label} interactive />
          </div>
        </div>
      )}
    </>
  )
}