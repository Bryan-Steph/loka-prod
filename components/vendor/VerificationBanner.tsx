'use client'

import Link from 'next/link'
import { Clock, ShieldAlert, RefreshCw } from 'lucide-react'

type Status = string | null | undefined

export function VerificationBanner({
  status,
  reason,
}: {
  status: Status
  reason?: string | null
}) {
  if (status === 'approved') return null

  if (status === 'rejected') {
    return (
      <div className="mt-4 flex gap-3 rounded-2xl border border-error/30 bg-error/10 p-4">
        <ShieldAlert size={20} className="mt-0.5 shrink-0 text-error" />
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-error">Verification rejected</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {reason || 'Your National ID could not be verified. Please re-check and resubmit your documents.'}
          </p>
          <Link
            href="/identity"
            className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-primary"
          >
            <RefreshCw size={13} />
            Resubmit documents
          </Link>
        </div>
      </div>
    )
  }

  // pending / unverified / anything else
  return (
    <div className="mt-4 flex gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4">
      <Clock size={20} className="mt-0.5 shrink-0 text-primary" />
      <div className="flex-1">
        <p className="text-[14px] font-semibold text-primary">Verification pending</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Our team is reviewing your National ID (usually 24–48 hours). You
          can browse the marketplace and set up your shop while you wait —
          publishing products unlocks once you&apos;re verified.
        </p>
      </div>
    </div>
  )
}