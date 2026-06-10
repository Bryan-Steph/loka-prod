'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, ImageIcon, Info, Search, BadgeCheck, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'
import { OnboardingPhotoTip } from '@/components/onboarding/OnboardingPhotoTip'
import { ImageUpload } from '@/components/ui/ImageUpload'

const NEXT_STEPS = [
  { icon: ShieldCheck, label: 'ID submitted for review', done: false },
  { icon: Search,      label: 'Shopsy admin verifies (24–48 hours)', done: false },
  { icon: BadgeCheck,  label: 'Verified badge added to your shop', done: false },
]

export default function IdentityStepPage() {
  const router = useRouter()
  const [frontUrl, setFrontUrl] = useState<string | null>(null)
  const [backUrl, setBackUrl]   = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const canSubmit = !!frontUrl && !!backUrl && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/vendors/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ front_url: frontUrl, back_url: backUrl }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Submission failed')
      }
      router.push('/vendor/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <OnboardingLayout
      step={4}
      backHref="/location"
      topTitle="Verify Your Identity"
      footer={
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/location')}
            className="flex h-[52px] flex-1 items-center justify-center rounded-xl border border-surface-3 text-sm text-foreground"
          >
            Back
          </button>
          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={cn(
              'flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl font-heading text-[15px] font-semibold transition-colors',
              canSubmit
                ? 'bg-primary text-primary-foreground'
                : 'cursor-not-allowed bg-surface-3 text-muted-foreground',
            )}
          >
            <ShieldCheck size={16} />
            {submitting ? 'Submitting...' : 'Submit for Review'}
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

      <div className="m-4 flex gap-2">
        {/* Front */}
        <div className="flex-1">
          <p className="mb-1.5 text-center font-mono text-[9px] uppercase text-primary">Front</p>
          {frontUrl ? (
            <div className="relative flex h-[100px] flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-success bg-success/10">
              <CheckCircle2 size={28} className="text-success" />
              <span className="text-xs text-success">Uploaded</span>
              <button
                type="button"
                onClick={() => setFrontUrl(null)}
                className="absolute right-2 top-2 font-mono text-[9px] text-muted-foreground underline"
              >
                replace
              </button>
            </div>
          ) : (
            <ImageUpload
              folder="Shopsy/identity_docs"
              accept="image/jpeg,image/png,application/pdf"
              maxSizeMB={5}
              resourceType="auto"
              onUpload={setFrontUrl}
              onError={setError}
            />
          )}
        </div>

        {/* Back */}
        <div className="flex-1">
          <p className="mb-1.5 text-center font-mono text-[9px] uppercase text-primary">Back</p>
          {backUrl ? (
            <div className="relative flex h-[100px] flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-success bg-success/10">
              <CheckCircle2 size={28} className="text-success" />
              <span className="text-xs text-success">Uploaded</span>
              <button
                type="button"
                onClick={() => setBackUrl(null)}
                className="absolute right-2 top-2 font-mono text-[9px] text-muted-foreground underline"
              >
                replace
              </button>
            </div>
          ) : (
            <ImageUpload
              folder="Shopsy/identity_docs"
              accept="image/jpeg,image/png,application/pdf"
              maxSizeMB={5}
              resourceType="auto"
              onUpload={setBackUrl}
              onError={setError}
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <Info size={14} className="text-muted-foreground" />
        <span className="font-mono text-[10px] text-muted-foreground">
          JPG, PNG or PDF · Max 5MB per file
        </span>
      </div>

      {error && (
        <p className="mx-4 mt-2 text-center text-xs text-error">{error}</p>
      )}

      <div className="m-4">
        <OnboardingPhotoTip />
      </div>

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
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2">
                    <Icon size={16} className="text-muted-foreground" />
                  </div>
                  {i < NEXT_STEPS.length - 1 && (
                    <span className="absolute top-9 h-3 border-l border-dashed border-surface-3" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </li>
            )
          })}
        </ol>
      </div>
    </OnboardingLayout>
  )
}