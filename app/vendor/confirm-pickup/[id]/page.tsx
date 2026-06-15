'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle2, AlertTriangle,
  Loader2, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatXAF } from '@/lib/data'

export default function VendorConfirmPickupPage() {
  const params = useParams()
  const router = useRouter()
  const txnId  = params?.id as string

  const [transaction, setTransaction] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading]         = useState(true)
  const [entry, setEntry]             = useState(['', '', '', '', '', ''])
  const [confirming, setConfirming]   = useState(false)
  const [released, setReleased]       = useState(false)
  const [error, setError]             = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(5)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!txnId) return
    fetch(`/api/transactions/${txnId}`)
      .then(r => r.json())
      .then(d => {
        if (d.role !== 'vendor') { router.push('/vendor/dashboard'); return }
        if (d.transaction) setTransaction(d.transaction)
        setAttemptsLeft(5 - ((d.pickup_attempts as number) ?? 0))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [txnId, router])

  function handleEntry(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next  = [...entry]; next[i] = digit; setEntry(next)
    if (digit && i < 5) inputRefs.current[i + 1]?.focus()
  }

  async function handleConfirm() {
    setConfirming(true); setError('')
    try {
      const res = await fetch(`/api/transactions/${txnId}/confirm-pickup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ entered_code: entry.join('') }),
      })
      const d = await res.json()
      if (!res.ok) {
        const match = (d.error as string)?.match(/(\d+) attempt/)
        if (match) setAttemptsLeft(parseInt(match[1], 10))
        throw new Error(d.error ?? 'Incorrect code')
      }
      setReleased(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation failed')
    } finally {
      setConfirming(false)
    }
  }

  async function handleDispute() {
    const reason = window.prompt('Describe the dispute:')
    if (!reason?.trim()) return
    await fetch(`/api/transactions/${txnId}/dispute`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    router.push('/vendor/enquiries')
  }

  const allFilled = entry.every(d => d !== '')
  const product   = transaction?.products as Record<string, unknown> | null

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    )
  }

  if (released) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background px-6 text-center">
        <CheckCircle2 size={72} className="text-success" />
        <h1 className="font-syne text-[26px] font-bold text-foreground">Payment Released!</h1>
        <p className="text-[14px] text-muted-foreground">
          {formatXAF((transaction?.agreed_price as number) ?? 0)} has been sent to your MTN MoMo.
        </p>
        <Link
          href="/vendor/dashboard"
          className="flex h-12 w-full max-w-[320px] items-center justify-center rounded-xl bg-primary font-syne text-[14px] font-semibold text-primary-foreground"
        >
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-3 bg-background/95 px-4 backdrop-blur">
        <button onClick={() => router.push('/vendor/enquiries')} className="flex h-10 w-9 items-center justify-center text-foreground">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-syne text-[18px] font-bold text-foreground">Confirm Pickup</h1>
        <div className="w-9" />
      </header>

      <div className="mx-auto max-w-sm space-y-6 px-4 pt-6">
        {product && (
          <div className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
            <p className="text-[14px] font-semibold text-foreground">{product.name_en as string}</p>
            <p className="mt-1 font-mono text-[20px] text-primary">
              {formatXAF((transaction?.agreed_price as number) ?? 0)}
            </p>
            <span className={cn(
              'mt-2 inline-block rounded-full px-2 py-0.5 font-mono text-[10px]',
              transaction?.status === 'funded'
                ? 'bg-success/15 text-success'
                : 'bg-surface-2 text-muted-foreground',
            )}>
              {String(transaction?.status ?? '').toUpperCase()}
            </span>
          </div>
        )}

        {transaction?.status !== 'funded' ? (
          <div className="rounded-xl border border-surface-3 bg-surface-2 p-4 text-center">
            <p className="text-[14px] text-muted-foreground">
              This transaction has status <strong>{String(transaction?.status ?? '')}</strong> and cannot be confirmed.
            </p>
            <Link href="/vendor/enquiries" className="mt-3 block text-[13px] text-primary">← Back to enquiries</Link>
          </div>
        ) : (
          <>
            <div className="flex gap-2.5 rounded-xl border-l-[3px] border-primary bg-surface-2 p-3.5">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[12px] text-muted-foreground">
                Ask the buyer to show their 6-digit pickup code. Enter it below to confirm and release payment to your MoMo.
              </p>
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
                    d ? 'border-success text-success' : 'border-surface-3 text-primary focus:border-primary',
                  )}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-error/10 px-3 py-2.5">
                <AlertTriangle size={14} className="shrink-0 text-error" />
                <p className="text-[12px] text-error">{error}</p>
              </div>
            )}

            {attemptsLeft < 5 && attemptsLeft > 0 && (
              <p className="text-center font-mono text-[11px] text-muted-foreground">
                {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
              </p>
            )}

            <button
              onClick={handleConfirm}
              disabled={!allFilled || confirming}
              className={cn(
                'flex h-[52px] w-full items-center justify-center gap-2 rounded-xl font-syne text-[15px] font-semibold transition-colors',
                allFilled ? 'bg-primary text-primary-foreground' : 'cursor-not-allowed bg-surface-3 text-muted-foreground',
              )}
            >
              {confirming ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Confirm & Release Payment</>}
            </button>

            <button onClick={handleDispute} className="flex w-full items-center justify-center gap-1.5 text-[13px] text-error">
              <AlertTriangle size={14} /> Raise a Dispute
            </button>
          </>
        )}
      </div>
    </div>
  )
}