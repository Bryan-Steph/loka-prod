'use client'

import { CreditCard, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImageUpload } from '@/components/ui/ImageUpload'

export interface IdentityVerificationData {
  id_document_type: 'national_id' | 'passport' | 'drivers_license' | ''
  id_card_front_url: string | null
  id_card_back_url: string | null
}

const ID_TYPES: { value: IdentityVerificationData['id_document_type']; label: string }[] = [
  { value: 'national_id',     label: 'National ID Card' },
  { value: 'passport',        label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
]

export function IdentityVerificationStep({
  value,
  onChange,
  onError,
}: {
  value: IdentityVerificationData
  onChange: (next: IdentityVerificationData) => void
  onError?: (msg: string) => void
}) {
  const backLabel = value.id_document_type === 'passport' ? 'Signature Page' : 'Back of ID'

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-syne text-[14px] font-bold text-foreground">Identity Document</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Upload a valid government-issued ID. This is kept private and used only for verification.
        </p>
      </div>

      <div>
        <p className="mb-1.5 text-[12px] text-muted-foreground">Document type</p>
        <div className="flex gap-2">
          {ID_TYPES.map(({ value: v, label }) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ ...value, id_document_type: v })}
              className={cn(
                'flex-1 rounded-xl py-2.5 text-[12px] font-medium transition-colors',
                value.id_document_type === v ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-muted-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <IdPhotoSlot
          label="Front of ID"
          url={value.id_card_front_url}
          onUpload={(u) => onChange({ ...value, id_card_front_url: u })}
          onClear={() => onChange({ ...value, id_card_front_url: null })}
          onError={onError}
        />
        <IdPhotoSlot
          label={backLabel}
          url={value.id_card_back_url}
          onUpload={(u) => onChange({ ...value, id_card_back_url: u })}
          onClear={() => onChange({ ...value, id_card_back_url: null })}
          onError={onError}
        />
      </div>
    </div>
  )
}

function IdPhotoSlot({
  label, url, onUpload, onClear, onError,
}: {
  label: string
  url: string | null
  onUpload: (url: string) => void
  onClear: () => void
  onError?: (msg: string) => void
}) {
  if (url) {
    return (
      <div className="relative">
        <img src={url} alt={label} className="h-[100px] w-full rounded-xl border border-surface-3 object-cover" />
        <button
          type="button"
          onClick={onClear}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-error text-white"
        >
          ×
        </button>
        <p className="mt-1 text-center font-mono text-[10px] text-muted-foreground">{label}</p>
      </div>
    )
  }

  return (
    <ImageUpload folder={"loka/vendor-ids" as any} onUpload={onUpload} onError={onError}>
      <div className="flex h-[100px] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-surface-3 bg-surface-2">
        <CreditCard size={20} className="text-muted-foreground" />
        <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
      </div>
    </ImageUpload>
  )
}