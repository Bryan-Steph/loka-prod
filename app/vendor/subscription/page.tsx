'use client'

import { CheckCircle2, CreditCard, Lock } from 'lucide-react'
import { VendorShell } from '@/components/vendor/VendorShell'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    id:       'free',
    name:     'Free',
    price:    0,
    badge:    'Current plan',
    bdgCls:   'bg-surface-3 text-muted-foreground',
    cardCls:  'border-primary/30',
    features: [
      'Up to 5 active products',
      'Basic search visibility',
      'In-app bargaining & chat',
      'Standard buyer discovery',
    ],
    cta:     'Active',
    ctaCls:  'bg-surface-2 text-muted-foreground cursor-default',
    locked:  false,
  },
  {
    id:       'pro',
    name:     'Pro',
    price:    2_500,
    badge:    'Popular',
    bdgCls:   'bg-primary/15 text-primary',
    cardCls:  'border-surface-3 opacity-80',
    features: [
      'Up to 50 active products',
      'Boosted search ranking',
      'Featured in category pages',
      'Sales analytics dashboard',
      'Priority buyer notifications',
    ],
    cta:     'Coming Soon',
    ctaCls:  'bg-surface-3 text-muted-foreground cursor-not-allowed',
    locked:  true,
  },
  {
    id:       'business',
    name:     'Business',
    price:    7_500,
    badge:    'Best value',
    bdgCls:   'bg-success/15 text-success',
    cardCls:  'border-surface-3 opacity-80',
    features: [
      'Unlimited active products',
      'Top search placement',
      'Home feed feature slot',
      'Advanced analytics & exports',
      'Multi-location branch support',
      'Dedicated account support',
    ],
    cta:     'Coming Soon',
    ctaCls:  'bg-surface-3 text-muted-foreground cursor-not-allowed',
    locked:  true,
  },
] as const

export default function VendorSubscriptionPage() {
  return (
    <VendorShell>
      <div className="mx-auto w-full max-w-[640px] px-4 pb-10 pt-5">
        <h1 className="font-syne text-[20px] font-bold text-foreground">Subscription</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Paid tiers will launch after public beta. Early vendors keep their Free plan benefits.
        </p>

        {/* Current plan summary card */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-foreground">Free Plan</p>
            <p className="text-[12px] text-muted-foreground">Active · 5 product limit</p>
          </div>
          <span className="ml-auto rounded-full bg-success/15 px-2.5 py-1 font-mono text-[10px] text-success">
            Active
          </span>
        </div>

        {/* Plan cards */}
        <div className="mt-5 space-y-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn('rounded-2xl border p-4', plan.cardCls)}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-syne text-[16px] font-bold text-foreground">
                      {plan.name}
                    </h2>
                    <span className={cn('rounded-full px-2 py-0.5 font-mono text-[9px]', plan.bdgCls)}>
                      {plan.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[13px] text-muted-foreground">
                    {plan.price === 0
                      ? 'Free forever'
                      : `${plan.price.toLocaleString()} XAF / month`}
                  </p>
                </div>
                {plan.locked && (
                  <Lock size={15} className="mt-1 shrink-0 text-muted-foreground" />
                )}
              </div>

              {/* Features */}
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-[12px] text-muted-foreground"
                  >
                    <CheckCircle2 size={13} className="shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                disabled
                className={cn(
                  'mt-4 h-10 w-full rounded-xl text-[13px] font-semibold',
                  plan.ctaCls,
                )}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-muted-foreground">
          All paid plans process via MTN Mobile Money.
          <br />
          No credit card required · Cancel anytime.
        </p>
      </div>
    </VendorShell>
  )
}