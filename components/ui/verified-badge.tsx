import { BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 16, md: 20, lg: 26 }

export function VerifiedBadge({ size = 'md', className }: VerifiedBadgeProps) {
  return (
    <BadgeCheck
      size={sizes[size]}
      className={cn('text-primary', className)}
    />
  )
}