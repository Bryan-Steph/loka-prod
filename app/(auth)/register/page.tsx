import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Store, ChevronRight } from 'lucide-react'
import { LOKAWordmark } from '@/components/ui/loka-wordmark'

export default function RegisterPage() {
  return (
    <main className="min-h-screen px-4 pb-10">
      {/* Top bar */}
      <header className="flex h-14 items-center justify-between">
        <Link
          href="/login"
          className="flex h-10 w-10 items-center justify-center text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </Link>
        <LOKAWordmark size={22} />
        <span className="h-8 w-8" aria-hidden="true" />
      </header>

      <div className="mx-auto mt-8 w-full max-w-[340px]">
        <h1 className="font-syne text-[28px] font-bold text-foreground">Join LOKA</h1>
        <p className="mb-8 mt-1 text-[14px] text-muted-foreground">
          How will you use LOKA?
        </p>

        <div className="flex flex-col gap-4">
          {/* Buyer */}
          <Link
            href="/register/buyer"
            className="group flex items-start gap-4 rounded-2xl border border-surface-3 bg-surface-1 p-5 transition-colors hover:border-primary"
          >
            <ShoppingBag size={32} className="shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <h2 className="font-syne text-[18px] font-bold text-foreground">
                I&apos;m a Buyer
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Browse verified vendors, bargain prices, and buy safely.
              </p>
            </div>
            <ChevronRight
              size={20}
              className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            />
          </Link>

          {/* Vendor */}
          <Link
            href="/register/vendor"
            className="group flex items-start gap-4 rounded-2xl border border-surface-3 bg-surface-1 p-5 transition-colors hover:border-primary"
          >
            <Store size={32} className="shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <h2 className="font-syne text-[18px] font-bold text-foreground">
                I&apos;m a Vendor
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                List your products, receive bargain offers, get paid instantly.
              </p>
              <span className="mt-2 inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 font-mono text-[9px] text-success">
                Get Verified ✓
              </span>
            </div>
            <ChevronRight
              size={20}
              className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            />
          </Link>
        </div>
      </div>
    </main>
  )
}
