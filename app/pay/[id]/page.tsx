'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ShieldCheck,
  Phone,
  Smartphone,
  CheckCircle2,
  MapPin,
  Copy,
  MessageSquare,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { ImagePlaceholder } from '@/components/ui/placeholders'
import { cn } from '@/lib/utils'

const PICKUP_CODE = ['4', '8', '2', '9', '1', '7']

export default function PayPage() {
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState<'mtn' | 'orange'>('mtn')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 3 — vendor code entry
  const [entry, setEntry] = useState(['', '', '', '', '', ''])
  const [released, setReleased] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function handlePay() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(2)
    }, 1600)
  }

  function handleEntry(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...entry]
    next[i] = digit
    setEntry(next)
    if (digit && i < 5) inputs.current[i + 1]?.focus()
  }

  function handleConfirm() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setReleased(true)
    }, 1600)
  }

  const allFilled = entry.every((d) => d !== '')

  const titles = ['Complete Purchase', 'Payment Confirmed', 'Confirm Pickup']

  return (
    <main className="min-h-screen pb-28">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button
          onClick={() => (step > 1 ? setStep((s) => s - 1) : history.back())}
          className="flex h-10 w-9 items-center justify-center text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-syne text-[16px] font-bold text-foreground">
          {titles[step - 1]}
        </h1>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((d) => (
            <span
              key={d}
              className={cn(
                'h-2 w-2 rounded-full',
                d === step ? 'bg-primary' : 'bg-surface-3',
              )}
            />
          ))}
        </div>
      </header>

      <div className="mx-auto w-full max-w-sm px-4 pt-5">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-surface-3 bg-surface-1 p-3">
              <ImagePlaceholder className="h-12 w-12 shrink-0 rounded-lg" iconSize={18} />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[13px] text-foreground">
                  Samsung Galaxy A32 (Unlocked)
                </p>
                <span className="font-mono text-[12px] text-primary">
                  Agreed price: 40,000 XAF
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 rounded-xl border-l-[3px] border-primary bg-surface-2 p-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[12px] text-muted-foreground">
                Your payment is held safely by Shopsy until you physically collect your
                item. Funds are only released when you enter the vendor&apos;s pickup
                code.
              </p>
            </div>

            <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
              <Row label="Product" value="40,000 XAF" />
              <Row
                label="Shopsy escrow fee (2%)"
                value="800 XAF"
                muted
              />
              <div className="my-2 h-px bg-surface-3" />
              <div className="flex items-center justify-between">
                <span className="font-syne text-[15px] font-bold text-foreground">
                  Total
                </span>
                <span className="font-mono text-[18px] font-medium text-primary">
                  40,800 XAF
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2 font-syne text-[14px] font-bold text-foreground">
                Pay with
              </p>
              <div className="space-y-2">
                <PayOption
                  selected={method === 'mtn'}
                  onClick={() => setMethod('mtn')}
                  name="MTN Mobile Money"
                  recommended
                />
                <PayOption
                  selected={method === 'orange'}
                  onClick={() => setMethod('orange')}
                  name="Orange Money"
                />
              </div>
            </div>

            <div className="flex h-12 items-stretch">
              <span className="flex items-center gap-1.5 rounded-l-xl border border-r-0 border-surface-3 bg-surface-3 px-3 font-mono text-[14px] text-primary">
                <Phone size={14} />
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

            <button
              onClick={handlePay}
              disabled={loading}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary font-syne text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-80"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Smartphone size={18} />
                  Pay 40,800 XAF via MoMo
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex flex-col items-center pt-2 text-center">
              <CheckCircle2
                size={64}
                className="animate-pulse-ring rounded-full text-success"
              />
              <h2 className="mt-4 font-syne text-[22px] font-bold text-foreground">
                Payment received!
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Your Shopsy escrow is holding 40,000 XAF
              </p>
            </div>

            <div className="rounded-2xl border-[1.5px] border-primary bg-surface-1 p-6 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                Your Pickup Code
              </p>
              <div className="mt-3 flex justify-center gap-2">
                {PICKUP_CODE.map((d, i) => (
                  <div
                    key={i}
                    className="flex h-16 w-[52px] items-center justify-center rounded-xl border border-surface-3 bg-surface-2 font-mono text-[32px] text-primary"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <p className="mt-3 font-mono text-[10px] text-muted-foreground">
                Valid for 48 hours
              </p>
              <p className="mt-1 font-mono text-[14px] text-primary">
                Expires in: 47:59:32
              </p>
            </div>

            <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
              <p className="flex items-start gap-2 text-[13px] text-foreground">
                <MapPin size={15} className="mt-0.5 shrink-0 text-primary" />
                Visit the vendor&apos;s shed and show this code
              </p>
              <p className="mt-1.5 pl-6 font-mono text-[11px] text-muted-foreground">
                Mama Agnes Electronics — Shed 14A, Commercial Avenue, Bamenda
              </p>
            </div>

            <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <MessageSquare size={14} className="shrink-0 text-success" />
              Code also sent to +237 6XX XXX XXX via SMS
            </p>

            <div className="space-y-2">
              <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-primary text-[14px] font-semibold text-primary">
                <MapPin size={16} />
                View Pickup Location
              </button>
              <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-2 text-[14px] font-medium text-muted-foreground">
                <Copy size={16} />
                Copy Code
              </button>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full pt-1 text-center text-[12px] text-primary"
            >
              I&apos;m the vendor — enter buyer code →
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && !released && (
          <div className="space-y-5">
            <p className="px-2 text-center text-[14px] text-muted-foreground">
              Ask the buyer to show their code. Enter it below to confirm pickup and
              release payment.
            </p>

            <div className="flex items-center gap-3 rounded-xl border border-surface-3 bg-surface-1 p-3">
              <ImagePlaceholder className="h-10 w-10 shrink-0 rounded-lg" iconSize={16} />
              <div className="min-w-0">
                <p className="line-clamp-1 text-[12px] text-foreground">
                  Samsung Galaxy A32 (Unlocked)
                </p>
                <span className="font-mono text-[12px] text-primary">40,000 XAF</span>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              {entry.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el
                  }}
                  value={d}
                  onChange={(e) => handleEntry(i, e.target.value)}
                  inputMode="numeric"
                  maxLength={1}
                  className={cn(
                    'h-16 w-[52px] rounded-xl border bg-surface-2 text-center font-mono text-[28px] focus:outline-none',
                    d
                      ? 'border-success text-success'
                      : 'border-surface-3 text-primary focus:border-primary focus:shadow-[0_0_0_3px_rgba(245,158,11,0.25)]',
                  )}
                />
              ))}
            </div>

            <button
              onClick={handleConfirm}
              disabled={!allFilled || loading}
              className={cn(
                'flex h-[52px] w-full items-center justify-center gap-2 rounded-xl font-syne text-[15px] font-semibold transition-colors',
                allFilled
                  ? 'bg-primary text-primary-foreground hover:bg-primary-dark'
                  : 'bg-surface-3 text-muted-foreground',
              )}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Confirm Pickup &amp; Release Payment
                </>
              )}
            </button>

            <button className="flex w-full items-center justify-center gap-1.5 text-[12px] text-error">
              <AlertTriangle size={14} />
              Raise a Dispute
            </button>
          </div>
        )}

        {/* STEP 3 — success */}
        {step === 3 && released && (
          <div className="flex flex-col items-center pt-10 text-center">
            <CheckCircle2 size={64} className="text-success" />
            <h2 className="mt-4 font-syne text-[24px] font-bold text-foreground">
              Payment Released!
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              40,000 XAF sent to your Mobile Money. Thank you for using Shopsy.
            </p>
            <Link
              href="/"
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl border border-surface-3 text-[14px] font-medium text-foreground"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

function Row({
  label,
  value,
  muted,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-[13px]',
          muted ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function PayOption({
  selected,
  onClick,
  name,
  recommended,
}: {
  selected: boolean
  onClick: () => void
  name: string
  recommended?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border bg-surface-1 p-3 transition-colors',
        selected ? 'border-primary' : 'border-surface-3',
      )}
    >
      <span className="h-8 w-8 shrink-0 rounded-full bg-[#F97316]" aria-hidden="true" />
      <span className="flex-1 text-left text-[14px] text-foreground">{name}</span>
      {recommended && (
        <span className="font-mono text-[9px] text-success">Recommended</span>
      )}
      <span
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-full border',
          selected ? 'border-primary' : 'border-surface-3',
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
    </button>
  )
}
