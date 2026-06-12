import { cn } from '@/lib/utils'

export function LokaWordmark({
  size = 26,
  tagline = false,
  className,
}: {
  size?: number
  tagline?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <span
        className="font-syne font-extrabold tracking-tight text-primary leading-none"
        style={{ fontSize: size }}
      >
        Loka
      </span>
      {tagline && (
        <span className="mt-2 text-[13px] text-muted-foreground">
          Find it. Bargain it. Get it.
        </span>
      )}
    </div>
  )
}
