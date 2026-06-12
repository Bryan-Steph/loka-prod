import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <span className="font-heading text-[32px] font-extrabold text-primary">
        Loka
      </span>
      <Loader2 size={24} className="mt-4 animate-spin text-primary" />
    </div>
  )
}