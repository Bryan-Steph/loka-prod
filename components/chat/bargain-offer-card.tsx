'use client'

import { X, ArrowLeftRight, Check } from 'lucide-react'
import { formatXAF } from '@/lib/data'
import { StatusBadge } from '@/components/ui/status-badge'

export function BargainOfferCard({
  kind,
  amount,
  original,
  note,
  meta,
  status,
  actions = false,
  onAccept,
  onCounter,
  onDecline,
}: {
  kind: 'BARGAIN OFFER' | 'COUNTER OFFER'
  amount: number
  original: number
  note?: string
  meta: string
  status: 'PENDING' | 'COUNTER'
  actions?: boolean
  onAccept?: () => void
  onCounter?: () => void
  onDecline?: () => void
}) {
  return (
    <div className="w-full rounded-2xl border-[1.5px] border-primary bg-surface-1 p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-widest text-primary">
          {kind}
        </span>
        <StatusBadge status={status} />
      </div>
      <p className="mt-2 font-mono text-[28px] leading-none text-primary">
        {formatXAF(amount)}
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground line-through opacity-50">
        Was {formatXAF(original)}
      </p>
      {note && (
        <p className="mt-2 text-[12px] italic text-muted-foreground">{note}</p>
      )}
      <p className="mt-2 font-mono text-[9px] text-muted-foreground">{meta}</p>

      {actions && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onDecline}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-error/60 py-2.5 text-[13px] font-medium text-error transition-colors hover:bg-error/10"
          >
            <X size={15} />
            Decline
          </button>
          <button
            type="button"
            onClick={onCounter}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-surface-3 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50"
          >
            <ArrowLeftRight size={15} />
            Counter
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            <Check size={15} />
            Accept
          </button>
        </div>
      )}
    </div>
  )
}
