import { Loader2 } from 'lucide-react'
import { LokaWordmark } from './Loka-wordmark'

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
      <LokaWordmark size={32} />
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 size={18} className="animate-spin text-primary" />
        <span className="font-mono text-xs">{label}</span>
      </div>
    </div>
  )
}
