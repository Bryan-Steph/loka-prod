import Link from 'next/link'
import { ShieldCheck, Clock, XCircle, ArrowLeft } from 'lucide-react'

type Status = 'pending' | 'suspended' | 'rejected' | string

const config: Record<string, { icon: typeof ShieldCheck; title: string; body: string; tone: string }> = {
  pending: {
    icon:  Clock,
    title: 'Verification Pending',
    body:  'Your verification video is being reviewed by a LOKA admin. This usually takes 24–48 hours. You will receive a notification once approved.',
    tone:  'text-primary',
  },
  suspended: {
    icon:  XCircle,
    title: 'Account Suspended',
    body:  'Your vendor account has been suspended due to reports. Contact LOKA support to resolve this.',
    tone:  'text-error',
  },
  rejected: {
    icon:  XCircle,
    title: 'Verification Rejected',
    body:  'Your verification was not approved. Please re-submit with a clearer video showing your face and shop.',
    tone:  'text-error',
  },
}

export function VerificationGate({ status }: { status: Status }) {
  const { icon: Icon, title, body, tone } = config[status] ?? config.pending

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-surface-2 ${tone}`}>
          <Icon size={40} />
        </div>

        <div>
          <h1 className={`font-syne text-[22px] font-bold ${tone}`}>{title}</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/vendor/dashboard"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-syne text-[14px] font-semibold text-primary-foreground"
          >
            Back to Dashboard
          </Link>

          {status === 'rejected' && (
            <Link
              href="/identity"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-surface-3 text-[14px] text-foreground"
            >
              <ShieldCheck size={16} className="text-primary" />
              Re-submit Verification
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}