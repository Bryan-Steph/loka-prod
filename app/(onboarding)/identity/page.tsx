'use client'
// identity/page.tsx

import { useState } from 'react'
import Link from 'next/link'
import {
  Upload,
  CheckCircle2,
  ImageIcon,
  Info,
  Search,
  BadgeCheck,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { OnboardingPhotoTip } from '@/components/onboarding/OnboardingPhotoTip'

function UploadCard({
  side,
  uploaded,
  onToggle,
}: {
  side: 'FRONT' | 'BACK'
  uploaded: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative flex h-[100px] flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-surface-3 bg-surface-2 p-3"
    >
      <span className="absolute left-1/2 top-2 -translate-x-1/2 font-mono text-[9px] uppercase text-primary">
        {side}
      </span>
      {uploaded ? (
        <>
          <CheckCircle2 size={28} className="text-success" />
          <span className="text-xs text-success">Uploaded</span>
          <ImageIcon
            size={14}
            className="absolute bottom-2 right-2 text-muted-foreground opacity-60"
          />
        </>
      ) : (
        <>
          <Upload size={28} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Tap to upload</span>
        </>
      )}
    </button>
  )
}

const NEXT_STEPS = [
  { icon: Upload, label: 'ID submitted for review', done: false },
  { icon: Search, label: 'LOKA admin verifies (24–48 hours)', done: false },
  {
    icon: BadgeCheck,
    label: 'Verified badge added to your shop',
    done: true,
  },
]

export default function IdentityStepPage() {
  const [front, setFront] = useState(true)
  const [back, setBack] = useState(false)
  const canSubmit = front && back

  return (
    <OnboardingLayout
      step={4}
      backHref="/location"
      topTitle="Verify Your Identity"
      footer={
        <div className="flex gap-3">
          <Link
            href="/location"
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-surface-3 text-sm text-foreground"
          >
            Back
          </Link>
          <button
            disabled={!canSubmit}
            className={cn(
              'flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl font-heading text-[15px] font-semibold',
              canSubmit
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-3 text-muted-foreground',
            )}
          >
            <ShieldCheck size={16} />
            Submit for Review
          </button>
        </div>
      }
    >
      <div className="px-4 pt-4">
        <h2 className="font-heading text-[22px] text-foreground">
          Upload Your National ID
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          We verify all vendors to protect buyers from fraud. Your ID is
          encrypted and deleted after review.
        </p>
      </div>

      {/* Upload cards */}
      <div className="m-4 flex gap-2">
        <UploadCard
          side="FRONT"
          uploaded={front}
          onToggle={() => setFront((v) => !v)}
        />
        <UploadCard
          side="BACK"
          uploaded={back}
          onToggle={() => setBack((v) => !v)}
        />
      </div>

      {/* File hint */}
      <div className="flex items-center justify-center gap-1.5">
        <Info size={14} className="text-muted-foreground" />
        <span className="font-mono text-[10px] text-muted-foreground">
          JPG, PNG or PDF · Max 5MB per file
        </span>
      </div>

      {/* Tips + security */}
      <div className="m-4">
        <OnboardingPhotoTip />
      </div>

      {/* What happens next */}
      <div className="mx-4 mb-4">
        <p className="mb-3 font-mono text-[10px] uppercase text-primary">
          What happens next?
        </p>
        <ol className="space-y-3">
          {NEXT_STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <li key={s.label} className="flex items-center gap-3">
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      s.done ? 'bg-success/15' : 'bg-surface-2',
                    )}
                  >
                    <Icon
                      size={16}
                      className={s.done ? 'text-success' : 'text-muted-foreground'}
                    />
                  </div>
                  {i < NEXT_STEPS.length - 1 ? (
                    <span className="absolute top-9 h-3 border-l border-dashed border-surface-3" />
                  ) : null}
                </div>
                <span
                  className={cn(
                    'text-xs',
                    s.done ? 'text-success' : 'text-muted-foreground',
                  )}
                >
                  {s.label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </OnboardingLayout>
  )
}
