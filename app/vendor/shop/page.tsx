'use client'
import { Store } from 'lucide-react'
import { VendorComingSoon } from '@/components/vendor/VendorComingSoon'

export default function VendorShopPage() {
  return (
    <VendorComingSoon
      icon={Store}
      title="My Shop"
      description="Your public shop profile visible to buyers."
      badge="Coming in Sprint 3"
    />
  )
}