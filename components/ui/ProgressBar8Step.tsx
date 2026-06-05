import { cn } from '@/lib/utils'

export function ProgressBar8Step({
  current,
  total = 8,
}: {
  current: number
  total?: number
}) {
  return (
    <div className="flex w-full items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full transition-all duration-300 ease-in-out',
            i < current ? 'bg-primary' : 'bg-surface-3',
          )}
        />
      ))}
    </div>
  )
}
