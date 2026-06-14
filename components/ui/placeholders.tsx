import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MapPlaceholderProps {
  className?: string
  label?: string
}

export function MapPlaceholder({ className, label }: MapPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-surface-3 bg-surface-2',
        className,
      )}
      style={{
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 19px, var(--surface-3) 19px, var(--surface-3) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, var(--surface-3) 19px, var(--surface-3) 20px)',
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <MapPin size={20} className="text-primary/60" />
        {label && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-[9px] text-primary">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}