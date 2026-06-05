import { cn } from '@/lib/utils'

export function SettingsSection({
  label,
  children,
  danger = false,
}: {
  label: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <section className="px-4">
      <h2
        className={cn(
          'mb-2 ml-1 font-mono text-[10px] uppercase tracking-[0.12em]',
          danger ? 'text-error' : 'text-primary',
        )}
      >
        {label}
      </h2>
      <div
        className={cn(
          'overflow-hidden rounded-2xl border bg-surface-1',
          danger ? 'border-error/60' : 'border-surface-3',
        )}
      >
        {children}
      </div>
    </section>
  )
}
