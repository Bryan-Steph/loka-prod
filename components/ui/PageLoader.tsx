import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-background">
      <span className="font-syne text-[32px] font-extrabold text-primary">LOKA</span>
      <Loader2 size={28} className="animate-spin text-primary" />
    </div>
  )
}