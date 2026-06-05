'use client'

import { useState } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Field({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  password = false,
  className,
  inputMode,
}: {
  icon: LucideIcon
  type?: string
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  password?: boolean
  className?: string
  inputMode?: 'text' | 'numeric' | 'email' | 'tel'
}) {
  const [show, setShow] = useState(false)
  const inputType = password ? (show ? 'text' : 'password') : type

  return (
    <div
      className={cn(
        'flex h-12 items-center gap-2.5 rounded-xl border border-surface-3 bg-surface-2 px-3 focus-within:border-primary',
        className,
      )}
    >
      <Icon size={16} className="shrink-0 text-muted-foreground" />
      <input
        type={inputType}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="h-full w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      {password && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  )
}
