import { Camera, Check, ShieldCheck } from 'lucide-react'

const TIPS = [
  'Good lighting — no shadows across your ID',
  'All 4 corners visible in the frame',
  'Text must be clearly readable',
  "No blurry or cropped images — they'll be rejected",
]

export function OnboardingPhotoTip() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Camera size={16} className="text-primary" />
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Tips for a faster review
          </h3>
        </div>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <Check size={12} className="mt-0.5 shrink-0 text-success" />
              <span className="text-xs leading-relaxed text-muted-foreground">
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border-l-[3px] border-primary bg-surface-2 p-4">
        <div className="flex gap-3">
          <ShieldCheck size={20} className="shrink-0 text-primary" />
          <div>
            <p className="text-[13px] font-semibold text-foreground">
              End-to-end encrypted
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Only Shopsy admins can access uploaded documents. All documents are
              permanently deleted within 48 hours of review, regardless of
              outcome.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
