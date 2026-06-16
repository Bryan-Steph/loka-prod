import { cn } from '@/lib/utils'

export type EmptyVariant =
  | 'products'
  | 'chat'
  | 'notifications'
  | 'search'
  | 'wishlist'
  | 'vendors'
  | 'generic'

interface EmptyStateProps {
  variant?:    EmptyVariant
  title:       string
  description?: string
  action?:     React.ReactNode
  className?:  string
}

/* ── Inline SVG illustrations ────────────────────────────────────────────── */
function Illustration({ variant }: { variant: EmptyVariant }) {
  const base = 'text-muted-foreground'
  switch (variant) {
    case 'products':
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className={base} aria-hidden>
          <rect x="9" y="18" width="54" height="40" rx="6" fill="currentColor" fillOpacity=".08" />
          <rect x="17" y="26" width="38" height="5" rx="2.5" fill="currentColor" fillOpacity=".2" />
          <rect x="17" y="35" width="26" height="4" rx="2"   fill="currentColor" fillOpacity=".14" />
          <rect x="17" y="43" width="18" height="4" rx="2"   fill="currentColor" fillOpacity=".1" />
          <circle cx="53" cy="16" r="9" fill="currentColor" fillOpacity=".12"
                  stroke="currentColor" strokeOpacity=".25" strokeWidth="1.5" />
          <path d="M50 16h6M53 13v6" stroke="currentColor" strokeOpacity=".4"
                strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'chat':
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className={base} aria-hidden>
          <rect x="7" y="14" width="44" height="30" rx="8" fill="currentColor" fillOpacity=".08"
                stroke="currentColor" strokeOpacity=".18" strokeWidth="1.5" />
          <rect x="21" y="32" width="44" height="26" rx="8" fill="currentColor" fillOpacity=".06"
                stroke="currentColor" strokeOpacity=".12" strokeWidth="1.5" />
          <rect x="14" y="22" width="22" height="4" rx="2" fill="currentColor" fillOpacity=".2" />
          <rect x="14" y="30" width="14" height="4" rx="2" fill="currentColor" fillOpacity=".13" />
        </svg>
      )
    case 'notifications':
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className={base} aria-hidden>
          <path d="M36 10C22 10 14 20 14 30v8L10 48h52l-4-10v-8C58 20 50 10 36 10z"
                fill="currentColor" fillOpacity=".08"
                stroke="currentColor" strokeOpacity=".2" strokeWidth="1.5" />
          <rect x="30" y="52" width="12" height="6" rx="3"
                fill="currentColor" fillOpacity=".14" />
        </svg>
      )
    case 'search':
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className={base} aria-hidden>
          <circle cx="30" cy="30" r="18" fill="currentColor" fillOpacity=".08"
                  stroke="currentColor" strokeOpacity=".2" strokeWidth="2" />
          <path d="M44 44L60 60" stroke="currentColor" strokeOpacity=".2"
                strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    case 'wishlist':
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className={base} aria-hidden>
          <path d="M36 58S12 42 12 26c0-8 6-14 12-14 5 0 9 3 12 7 3-4 7-7 12-7 6 0 12 6 12 14 0 16-24 32-24 32z"
                fill="currentColor" fillOpacity=".1"
                stroke="currentColor" strokeOpacity=".2" strokeWidth="2" />
        </svg>
      )
    case 'vendors':
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className={base} aria-hidden>
          <rect x="8" y="24" width="56" height="32" rx="6" fill="currentColor" fillOpacity=".08" />
          <path d="M8 30l10-14h36l10 14" stroke="currentColor" strokeOpacity=".2" strokeWidth="1.5" />
          <rect x="26" y="38" width="20" height="18" rx="2" fill="currentColor" fillOpacity=".12" />
        </svg>
      )
    default:
      return (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className={base} aria-hidden>
          <circle cx="36" cy="36" r="26" fill="currentColor" fillOpacity=".08"
                  stroke="currentColor" strokeOpacity=".14" strokeWidth="1.5" />
          <path d="M36 24v14M36 44v4" stroke="currentColor" strokeOpacity=".3"
                strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
  }
}

export function EmptyState({
  variant = 'generic',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 py-12 text-center', className)}>
      <Illustration variant={variant} />
      <div>
        <p className="font-syne text-[15px] font-bold text-foreground">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-[220px] text-[12px] text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}