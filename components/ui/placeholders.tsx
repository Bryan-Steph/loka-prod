import { ImageIcon, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ImagePlaceholder({
  className,
  iconSize = 24,
}: {
  className?: string
  iconSize?: number
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-surface-2 text-muted-foreground',
        className,
      )}
      aria-hidden="true"
    >
      <ImageIcon size={iconSize} />
    </div>
  )
}

export function MapPlaceholder({
  className,
  label = 'Map — Leaflet.js',
}: {
  className?: string
  label?: string
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-surface-2',
        className,
      )}
      aria-hidden="true"
    >
      <MapPin size={32} className="text-primary" />
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}
