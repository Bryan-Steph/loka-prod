'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ShieldCheck, Phone, Smartphone,
  CheckCircle2, MapPin, Copy, MessageSquare,
  AlertTriangle, Loader2, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatXAF } from '@/lib/data'

const FEE_RATE = 0.02

export default function PayPage() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const productId    = params?.id as string

  // Product data
  const [product, setProduct]               = useState<Record<string, unknown> | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)

  // Payment state
  const [step, setStep]       = useState(1)
  const [phone, setPhone]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Transaction
  const [transactionId, setTransactionId]   = useState<string | null>(searchParams.get('txn'))
  const [paymentLink, setPaymentLink]       = useState<string | null>(null)
  const [polling, setPolling]               = useState(false)
  const [agreedPrice, setAgreedPrice]       = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pickup code (step 2)
  const [pickupCode, setPickupCode] = useState<string[]>([])

  // Vendor code entry (step 3)
  const [entry, setEntry]           = useState(['', '', '', '', '', ''])
  const [released, setReleased]     = useState(false)
  const [confirmError, setConfirmError] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(5)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Agreed price from bargain offer
  const bargainAmount = searchParams.get('amount')
    ? parseInt(searchParams.get('amount')!, 10)
    : null

  const offerId = searchParams.get('offer') ?? undefined

  // Load product
  useEffect(() => {
    if (!productId) return
    fetch(`/api/products/${productId}`)
      .then(r => r.json())
      .then(d => { if (d.product) setProduct(d.product) })
      .finally(() => setLoadingProduct(false))
  }, [productId])

  // Derived pricing
  const vendor      = product?.vendors as Record<string, unknown> | null
  const listedPrice = product?.price as number | undefined
  const payPrice    = bargainAmount ?? listedPrice ?? 0
  const fee         = Math.round(payPrice * FEE_RATE)
  const total       = payPrice + fee

  // ── Polling ──────────────────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollRef.current)    clearInterval(pollRef.current)
    if (pollTimeout.current) clearTimeout(pollTimeout.current)
    pollRef.current    = null
    pollTimeout.current = null
    setPolling(false)
  }, [])

  const startPolling = useCallback((txnId: string) => {
    setPolling(true)
    if (pollRef.current) clearInterval(pollRef.current)

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/transactions/${txnId}`)
        if (!res.ok) return
        const d   = await res.json()
        const status = d.transaction?.status as string | undefined

        if (status === 'funded') {
          stopPolling()
          setAgreedPrice(d.transaction.agreed_price as number)
          const code = d.pickup_code as string | null
          if (code?.length === 6) setPickupCode(code.split(''))
          setStep(2)
        } else if (['expired', 'disputed', 'refunded'].includes(status ?? '')) {
          stopPolling()
          setError(`Transaction ${status}. Please contact LOKA support if funds were deducted.`)
        }
      } catch (e) {
        console.error('[PAY] Poll error:', e)
      }
    }, 3000)

    // Timeout after 10 minutes
    pollTimeout.current = setTimeout(() => {
      stopPolling()
      setError(
        'Payment confirmation is taking longer than expected. ' +
        'If MoMo approved the request, check your notifications or contact LOKA support.',
      )
    }, 10 * 60 * 1000)
  }, [stopPolling])

  // Resume polling if returning from Fapshi redirect with ?txn=
  useEffect(() => {
    if (transactionId && !polling && step === 1) {
      startPolling(transactionId)
    }
  }, [transactionId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => stopPolling(), [stopPolling])

  // ── Step 1: Initiate payment ──────────────────────────────────────────────

  async function handlePay() {
    if (!phone.trim()) { setError('Enter your MTN MoMo phone number'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/transactions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id:       productId,
          phone:            phone.trim(),
          agreed_price:     bargainAmount ?? undefined,
          bargain_offer_id: offerId,
        }),
      })

      const d = await res.json()

      if (!res.ok) {
        // Already has an active transaction — resume polling
        if (res.status === 409 && d.transactionId) {
          setTransactionId(d.transactionId)
          startPolling(d.transactionId)
          return
        }
        throw new Error(d.error ?? 'Payment initiation failed')
      }

      setTransactionId(d.transactionId)
      if (d.paymentLink) setPaymentLink(d.paymentLink)
      setAgreedPrice(d.agreedPrice ?? payPrice)
      startPolling(d.transactionId)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: Vendor enters buyer's code ───────────────────────────────────

  function handleEntry(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next  = [...entry]
    next[i]     = digit
    setEntry(next)
    if (digit && i < 5) inputRefs.current[i + 1]?.focus()
  }

  async function handleConfirm() {
    setLoading(true)
    setConfirmError('')

    try {
      const res = await fetch(`/api/transactions/${transactionId}/confirm-pickup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ entered_code: entry.join('') }),
      })
      const d = await res.json()

      if (!res.ok) {
        // Update attempts display from error message
        const match = (d.error as string)?.match(/(\d+) attempt/)
        if (match) setAttemptsLeft(parseInt(match[1], 10))
        throw new Error(d.error ?? 'Incorrect code')
      }

      setReleased(true)
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'Confirmation failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDispute() {
    const reason = window.prompt(
      'Describe the dispute reason (e.g. "Item not received", "Wrong item"):',
    )
    if (!reason?.trim() || !transactionId) return

    await fetch(`/api/transactions/${transactionId}/dispute`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ reason }),
    })

    setError('Dispute raised. LOKA support will contact you within 24 hours.')
  }

  const allFilled   = entry.every(d => d !== '')
  const titles      = ['Complete Purchase', 'Payment Confirmed', 'Confirm Pickup']
  const vendorName  = vendor?.shop_name  as string | undefined
  const vendorAddr  = vendor?.address_text as string | undefined

  if (loadingProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : history.back()}
          className="flex h-10 w-9 items-center justify-center text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-syne text-[16px] font-bold text-foreground">{titles[step - 1]}</h1>
        <div className="flex gap-1.5">
          {[1, 2, 3].map(d => (
            <span key={d} className={cn('h-2 w-2 rounded-full', d === step ? 'bg-primary' : 'bg-surface-3')} />
          ))}
        </div>
      </header>

      <div className="mx-auto w-full max-w-sm px-4 pt-5">

        {/* ── STEP 1: Payment initiation ─────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Product summary */}
            <div className="rounded-xl border border-surface-3 bg-surface-1 p-3">
              <p className="text-[13px] font-medium text-foreground">
                {product?.name_en as string ?? 'Product'}
              </p>
              <p className="mt-0.5 font-mono text-[12px] text-primary">
                {bargainAmount ? `Bargained: ${formatXAF(bargainAmount)}` : formatXAF(payPrice)}
              </p>
              {vendorName && (
                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{vendorName}</p>
              )}
            </div>

            {/* Escrow notice */}
            <div className="flex gap-2.5 rounded-xl border-l-[3px] border-primary bg-surface-2 p-3">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[12px] text-muted-foreground">
                Your payment is held safely by LOKA until you physically collect your item.
                Funds release only after you confirm pickup with the vendor's code.
              </p>
            </div>

            {/* Price breakdown */}
            <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
              <div className="flex justify-between py-1">
                <span className="text-[13px] text-muted-foreground">Product</span>
                <span className="font-mono text-[13px] text-foreground">{formatXAF(payPrice)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[13px] text-muted-foreground">LOKA escrow fee (2%)</span>
                <span className="font-mono text-[13px] text-muted-foreground">{formatXAF(fee)}</span>
              </div>
              <div className="my-2 h-px bg-surface-3" />
              <div className="flex items-center justify-between">
                <span className="font-syne text-[15px] font-bold text-foreground">Total</span>
                <span className="font-mono text-[18px] font-medium text-primary">{formatXAF(total)}</span>
              </div>
            </div>

            {!polling ? (
              <>
                {/* MTN MoMo — only option */}
                <div>
                  <p className="mb-2 font-syne text-[14px] font-bold text-foreground">Pay with</p>
                  <div className="flex items-center gap-3 rounded-xl border border-primary bg-surface-1 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F9C802] font-mono text-[10px] font-bold text-black">
                      MTN
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] text-foreground">MTN Mobile Money</p>
                      <p className="font-mono text-[10px] text-success">USSD push to your handset</p>
                    </div>
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-primary">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </span>
                  </div>
                </div>

                {/* Phone number */}
                <div className="flex h-12 items-stretch">
                  <span className="flex items-center gap-1.5 rounded-l-xl border border-r-0 border-surface-3 bg-surface-3 px-3 font-mono text-[14px] text-primary">
                    <Phone size={14} /> +237
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="6XX XXX XXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="h-full w-full rounded-r-xl border border-surface-3 bg-surface-2 px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="rounded-xl bg-error/10 px-3 py-2.5 text-[12px] text-error">{error}</p>
                )}

                <button
                  onClick={handlePay}
                  disabled={loading || !phone.trim()}
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary font-syne text-[15px] font-semibold text-primary-foreground disabled:opacity-70"
                >
                  {loading
                    ? <Loader2 size={18} className="animate-spin" />
                    : <><Smartphone size={18} /> Pay {formatXAF(total)} via MoMo</>
                  }
                </button>

                {paymentLink && (
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-surface-3 text-[13px] text-primary"
                  >
                    <RefreshCw size={14} />
                    No USSD? Use payment link instead
                  </a>
                )}
              </>
            ) : (
              /* Polling state */
              <div className="flex flex-col items-center gap-5 py-8 text-center">
                <div className="relative h-20 w-20">
                  <div className="h-20 w-20 rounded-full border-4 border-surface-3" />
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <Smartphone size={28} className="absolute inset-0 m-auto text-primary" />
                </div>
                <div>
                  <h2 className="font-syne text-[18px] font-bold text-foreground">
                    Waiting for MoMo Approval
                  </h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    A USSD prompt was sent to your phone.<br />
                    Approve the MTN MoMo payment to continue.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-4 py-3">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  <p className="font-mono text-[11px] text-muted-foreground">
                    Listening for confirmation…
                  </p>
                </div>
                {paymentLink && (
                  <a
                    href={paymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[12px] text-primary underline"
                  >
                    <RefreshCw size={12} />
                    Didn't get USSD? Pay via link
                  </a>
                )}
                {error && (
                  <p className="max-w-[280px] text-[12px] text-error">{error}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Pickup code ───────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex flex-col items-center pt-2 text-center">
              <CheckCircle2 size={64} className="text-success" />
              <h2 className="mt-4 font-syne text-[22px] font-bold text-foreground">
                Payment Confirmed!
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                LOKA escrow is holding {formatXAF(agreedPrice || payPrice)}
              </p>
            </div>

            {pickupCode.length === 6 ? (
              <div className="rounded-2xl border-[1.5px] border-primary bg-surface-1 p-6 text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  Your Pickup Code
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  {pickupCode.map((d, i) => (
                    <div
                      key={i}
                      className="flex h-16 w-[52px] items-center justify-center rounded-xl border border-surface-3 bg-surface-2 font-mono text-[32px] text-primary"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <p className="mt-3 font-mono text-[10px] text-muted-foreground">Valid for 48 hours</p>
                <button
                  onClick={() => navigator.clipboard.writeText(pickupCode.join(''))}
                  className="mt-2 flex w-full items-center justify-center gap-1 text-[11px] text-muted-foreground underline"
                >
                  <Copy size={11} /> Copy code
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-surface-3 bg-surface-1 p-6 text-center">
                <Loader2 size={24} className="animate-spin text-primary" />
                <p className="text-[13px] text-muted-foreground">
                  Generating your pickup code…<br />
                  It will also arrive via SMS shortly.
                </p>
              </div>
            )}

            {vendorAddr && (
              <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
                <p className="flex items-start gap-2 text-[13px] text-foreground">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-primary" />
                  Visit the vendor's shed and show this code
                </p>
                <p className="mt-1.5 pl-6 font-mono text-[11px] text-muted-foreground">
                  {vendorName} — {vendorAddr}
                </p>
              </div>
            )}

            <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <MessageSquare size={14} className="shrink-0 text-success" />
              Code also sent to your phone via SMS
            </p>

            <button
              onClick={() => setStep(3)}
              className="w-full text-center text-[12px] text-primary"
            >
              I'm the vendor — enter buyer code →
            </button>
          </div>
        )}

        {/* ── STEP 3: Vendor code entry ─────────────────────────────── */}
        {step === 3 && !released && (
          <div className="space-y-5">
            <p className="px-2 text-center text-[14px] text-muted-foreground">
              Ask the buyer to show their 6-digit code. Enter it to confirm pickup and release payment.
            </p>

            <div className="rounded-xl border border-surface-3 bg-surface-1 p-3">
              <p className="text-[13px] text-foreground">{product?.name_en as string}</p>
              <p className="font-mono text-[12px] text-primary">{formatXAF(agreedPrice || payPrice)}</p>
            </div>

            <div className="flex justify-center gap-2">
              {entry.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  value={d}
                  onChange={e => handleEntry(i, e.target.value)}
                  inputMode="numeric"
                  maxLength={1}
                  className={cn(
                    'h-16 w-[52px] rounded-xl border bg-surface-2 text-center font-mono text-[28px] focus:outline-none',
                    d
                      ? 'border-success text-success'
                      : 'border-surface-3 text-primary focus:border-primary',
                  )}
                />
              ))}
            </div>

            {confirmError && (
              <div className="flex items-center gap-2 rounded-xl bg-error/10 px-3 py-2.5">
                <AlertTriangle size={14} className="shrink-0 text-error" />
                <p className="text-[12px] text-error">{confirmError}</p>
              </div>
            )}

            {attemptsLeft < 5 && attemptsLeft > 0 && (
              <p className="text-center font-mono text-[11px] text-muted-foreground">
                {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
              </p>
            )}

            <button
              onClick={handleConfirm}
              disabled={!allFilled || loading}
              className={cn(
                'flex h-[52px] w-full items-center justify-center gap-2 rounded-xl font-syne text-[15px] font-semibold',
                allFilled ? 'bg-primary text-primary-foreground' : 'bg-surface-3 text-muted-foreground',
              )}
            >
              {loading
                ? <Loader2 size={18} className="animate-spin" />
                : <><CheckCircle2 size={18} /> Confirm Pickup & Release Payment</>
              }
            </button>

            <button
              onClick={handleDispute}
              className="flex w-full items-center justify-center gap-1.5 text-[13px] text-error"
            >
              <AlertTriangle size={14} />
              Raise a Dispute
            </button>
          </div>
        )}

        {/* ── STEP 3 success ────────────────────────────────────────── */}
        {step === 3 && released && (
          <div className="flex flex-col items-center pt-10 text-center">
            <CheckCircle2 size={72} className="text-success" />
            <h2 className="mt-4 font-syne text-[24px] font-bold text-foreground">
              Payment Released!
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {formatXAF(agreedPrice || payPrice)} sent to your MTN MoMo.
              Thank you for using LOKA.
            </p>
            <Link
              href="/vendor/dashboard"
              className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-primary font-syne text-[14px] font-semibold text-primary-foreground"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}