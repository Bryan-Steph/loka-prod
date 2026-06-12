import Link from 'next/link'
import { ShieldCheck, Clock, ArrowLeft, RefreshCw } from 'lucide-react'

export function VerificationGate({ status }: { status?: string | null }) {
  const rejected = status === 'rejected'

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col items-center px-5 pt-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        {rejected ? (
          <RefreshCw size={28} className="text-primary" />
        ) : (
          <Clock size={28} className="text-primary" />
        )}
      </div>

      <h1 className="font-syne text-[18px] font-bold text-foreground">
        {rejected ? 'Resubmission required' : 'Verification pending'}
      </h1>

      <p className="mt-2 text-[13px] text-muted-foreground">
        {rejected
          ? 'Your previous ID submission was rejected. Resubmit your National ID to start publishing products.'
          : "You'll be able to add products once your National ID is verified — usually within 24–48 hours."}
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href="/vendor/dashboard"
          className="flex h-11 items-center gap-2 rounded-xl border border-surface-3 px-4 text-[13px] text-foreground"
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </Link>
        {rejected && (
          <Link
            href="/identity"
            className="flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground"
          >
            <ShieldCheck size={15} />
            Resubmit ID
          </Link>
        )}
      </div>
    </div>
  )
}