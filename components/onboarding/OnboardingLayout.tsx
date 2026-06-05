'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProgressBar8Step } from '@/components/ui/ProgressBar8Step'

export function OnboardingLayout({
  step,
  topTitle,
  backHref,
  children,
  footer,
}: {
  step: number
  topTitle: React.ReactNode
  backHref: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-surface-3 bg-surface-1">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Link
            href={backHref}
            aria-label="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground active:bg-surface-2"
          >
            <ArrowLeft size={22} />
          </Link>
          <h1 className="flex-1 text-center font-heading text-lg font-bold text-foreground">
            {topTitle}
          </h1>
          <div className="w-9" />
        </div>
        <div className="px-4 pb-3">
          <p className="mb-2 text-right font-mono text-[11px] text-primary">
            {`Step ${step} of 8`}
          </p>
          <ProgressBar8Step current={step} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28">{children}</main>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] border-t border-surface-3 bg-surface-1 p-4">
        {footer}
      </div>
    </div>
  )
}
