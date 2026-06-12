'use client'

import { useState } from 'react'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Field } from '@/components/ui/field'
import { cn } from '@/lib/utils'

function strengthOf(pw: string): number {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export function RegistrationFields() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [lang, setLang] = useState<'en' | 'fr'>('en')
  const [agreed, setAgreed] = useState(false)

  const strength = strengthOf(password)

  return (
    <div className="space-y-3">
      <Field icon={User} placeholder="Your full name" value={name} onChange={setName} />
      <Field
        icon={Mail}
        type="email"
        inputMode="email"
        placeholder="your@email.com"
        value={email}
        onChange={setEmail}
      />

      {/* Phone compound */}
      <div className="flex h-12 items-stretch">
        <span className="flex items-center rounded-l-xl border border-r-0 border-surface-3 bg-surface-3 px-3 font-mono text-[14px] text-primary">
          +237
        </span>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="6XX XXX XXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-full w-full rounded-r-xl border border-surface-3 bg-surface-2 px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {/* Password with strength */}
      <div>
        <div className="flex h-12 items-center gap-2.5 rounded-xl border border-surface-3 bg-surface-2 px-3 focus-within:border-primary">
          <Lock size={16} className="shrink-0 text-muted-foreground" />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-full w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="mt-2 flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i < strength ? 'bg-primary' : 'bg-surface-3',
              )}
            />
          ))}
        </div>
      </div>

      <Field
        icon={Lock}
        password
        placeholder="Confirm password"
        value={confirm}
        onChange={setConfirm}
      />

      {/* Language preference */}
      <div>
        <p className="mb-1.5 text-[12px] text-muted-foreground">Preferred language</p>
        <div className="flex gap-2">
          {(
            [
              { key: 'en', label: 'English' },
              { key: 'fr', label: 'Français' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setLang(opt.key)}
              className={cn(
                'flex-1 rounded-xl py-2.5 text-[13px] font-medium transition-colors',
                lang === opt.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-2 text-muted-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terms */}
      <button
        type="button"
        onClick={() => setAgreed((a) => !a)}
        className="flex items-start gap-2.5 text-left"
      >
        <span
          className={cn(
            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border',
            agreed ? 'border-primary bg-primary' : 'border-surface-3 bg-surface-2',
          )}
        >
          {agreed && (
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-primary-foreground">
              <path
                d="M2 6l3 3 5-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <span className="text-[12px] text-muted-foreground">
          I agree to Loka&apos;s <span className="text-primary">Terms of Service</span>{' '}
          and <span className="text-primary">Privacy Policy</span>
        </span>
      </button>
    </div>
  )
}
