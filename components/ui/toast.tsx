'use client'

import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

const CONFIG: Record<
  ToastVariant,
  { border: string; icon: typeof CheckCircle2; color: string }
> = {
  success: { border: 'border-l-success', icon: CheckCircle2, color: 'text-success' },
  error: { border: 'border-l-error', icon: AlertCircle, color: 'text-error' },
  info: { border: 'border-l-primary', icon: Info, color: 'text-primary' },
}

export function Toast({
  message,
  variant = 'success',
  onClose,
}: {
  message: string
  variant?: ToastVariant
  onClose?: () => void
}) {
  const { border, icon: Icon, color } = CONFIG[variant]
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        role="status"
        className={cn(
          'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-surface-3 border-l-4 bg-surface-1 px-4 py-3 shadow-lg',
          border,
        )}
      >
        <Icon size={18} className={color} />
        <span className="flex-1 text-[13px] text-foreground">{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
