'use client'

import Link from 'next/link'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-[380px]">
        <p className="mb-8 text-center font-heading text-[32px] font-extrabold text-primary">
          Loka
        </p>
        <div className="rounded-2xl border border-surface-3 bg-surface-1 p-6">
          <h1 className="text-center font-heading text-[22px] text-foreground">
            Welcome back
          </h1>
          <p className="mb-6 mt-1 text-center text-[13px] text-muted-foreground">
            Sign in to continue bargaining.
          </p>

          <form className="space-y-4">
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="email"
                placeholder="your@email.com"
                className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="password"
                placeholder="Password"
                className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <Link
              href="/forgot-password"
              className="block text-right text-xs text-primary"
            >
              Forgot password?
            </Link>

            <Link
              href="/feed"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-heading text-[15px] font-semibold text-primary-foreground"
            >
              Sign In
              <ArrowRight size={18} />
            </Link>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Want to sell?{' '}
            <Link href="/account" className="font-semibold text-primary">
              Become a vendor
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
