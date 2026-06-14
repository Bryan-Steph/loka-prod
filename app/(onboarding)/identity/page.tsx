'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Video, CheckCircle2, Info, Search,
  BadgeCheck, ShieldCheck, Upload, Loader2, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout'

const NEXT_STEPS = [
  { icon: Upload,     label: 'Video submitted for review' },
  { icon: Search,     label: 'LOKA admin verifies (24–48 hours)' },
  { icon: BadgeCheck, label: 'Verified badge added to your shop' },
]

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

export default function IdentityStepPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [videoUrl, setVideoUrl]         = useState<string | null>(null)
  const [uploadState, setUploadState]   = useState<UploadState>('idle')
  const [progress, setProgress]         = useState(0)
  const [uploadError, setUploadError]   = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [submitError, setSubmitError]   = useState('')

  const canSubmit = !!videoUrl && !submitting

  const handleFileSelect = async (file: File) => {
    // Max 50 MB
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('Video must be under 50 MB')
      setUploadState('error')
      return
    }

    setUploadState('uploading')
    setProgress(0)
    setUploadError('')

    try {
      const sigRes = await fetch(
        `/api/products/cloudinary-signature?folder=loka/vendor_videos&resourceType=video`,
      )
      if (!sigRes.ok) throw new Error('Could not get upload token')
      const sig = await sigRes.json()

      const form = new FormData()
      form.append('file',         file)
      form.append('api_key',      sig.apiKey)
      form.append('timestamp',    String(sig.timestamp))
      form.append('signature',    sig.signature)
      form.append('folder',       sig.folder)
      form.append('resource_type','video')

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText)
            setVideoUrl(data.secure_url)
            setUploadState('done')
            setProgress(100)
            resolve()
          } else {
            reject(new Error('Upload failed'))
          }
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.send(form)
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setUploadError(msg)
      setUploadState('error')
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setSubmitError('')

    try {
      const res = await fetch('/api/vendors/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: videoUrl }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Submission failed')
      }
      router.push('/vendor/dashboard')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
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
          Record a 30-Second Verification Video
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Stand in your shop or market shed, show your face and your surroundings clearly.
          This proves you are a real vendor operating from a real location.
        </p>
      </div>

      {/* Video upload area */}
      <div className="m-4">
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFileSelect(f)
          }}
        />

        {uploadState === 'done' && videoUrl ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-success bg-success/10 p-5">
            <CheckCircle2 size={36} className="text-success" />
            <p className="font-syne text-[15px] font-semibold text-success">Video uploaded</p>
            <button
              type="button"
              onClick={() => { setVideoUrl(null); setUploadState('idle'); if (inputRef.current) inputRef.current.value = '' }}
              className="font-mono text-[11px] text-muted-foreground underline"
            >
              Replace video
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploadState === 'uploading'}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex h-[140px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors',
              uploadState === 'uploading' && 'border-primary bg-primary/5',
              uploadState === 'error'     && 'border-error bg-error/10',
              uploadState === 'idle'      && 'border-surface-3 bg-surface-2',
            )}
          >
            {uploadState === 'uploading' ? (
              <>
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="font-mono text-[13px] text-primary">Uploading... {progress}%</p>
              </>
            ) : uploadState === 'error' ? (
              <>
                <AlertCircle size={32} className="text-error" />
                <p className="text-[13px] text-error">{uploadError}</p>
                <p className="font-mono text-[11px] text-muted-foreground">Tap to try again</p>
              </>
            ) : (
              <>
                <Video size={32} className="text-muted-foreground" />
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-foreground">Tap to select video</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    MP4 · MOV · WebM · Max 50 MB · Max 30 seconds
                  </p>
                </div>
              </>
            )}
          </button>
        )}

        {uploadState === 'uploading' && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* What to show in the video */}
      <div className="mx-4 rounded-2xl border border-surface-3 bg-surface-1 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Video size={16} className="text-primary" />
          <h3 className="font-heading text-sm font-semibold text-foreground">
            What your video must show
          </h3>
        </div>
        <ul className="space-y-2">
          {[
            'Your face — look directly at the camera',
            'Your shop, stall, or market shed clearly',
            'Your products or stock visible in the background',
            'Speak your shop name aloud (e.g. "This is Mama Agnes Electronics")',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-0.5 text-primary">✓</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-4 mt-4 rounded-xl border-l-[3px] border-primary bg-surface-2 p-3.5">
        <div className="flex gap-3">
          <ShieldCheck size={20} className="shrink-0 text-primary" />
          <div>
            <p className="text-[13px] font-semibold text-foreground">End-to-end encrypted</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Only LOKA admins can access your verification video. It is permanently deleted
              within 48 hours of review, regardless of outcome.
            </p>
          </div>
        </div>
      </div>

      {submitError && (
        <p className="mx-4 mt-3 text-center text-xs text-error">{submitError}</p>
      )}

      <div className="mx-4 my-4">
        <p className="mb-3 font-mono text-[10px] uppercase text-primary">What happens next?</p>
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