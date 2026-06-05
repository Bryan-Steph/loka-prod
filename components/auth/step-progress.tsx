import { cn } from '@/lib/utils'

export function StepProgress({
  step,
  total = 8,
}: {
  step: number
  total?: number
}) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 flex-1 rounded-full',
            i < step ? 'bg-primary' : 'bg-surface-3',
          )}
        />
      ))}
    </div>
  )
}
