'use client'

import { VendorShell } from '@/components/vendor/VendorShell'

interface VendorComingSoonProps {
  icon: React.ElementType
  title: string
  description: string
  badge?: string
}

export function VendorComingSoon({
  icon: Icon,
  title,
  description,
  badge,
}: VendorComingSoonProps) {
  return (
    <VendorShell>
      <div className="flex flex-col items-center gap-4 px-4 pt-16">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-surface-3 bg-surface-1">
          <Icon size={28} className="text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-syne text-[18px] font-bold text-foreground">{title}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
        </div>
        {badge && (
          <span className="rounded-full bg-surface-2 px-3 py-1 font-mono text-[11px] text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
    </VendorShell>
  )
}