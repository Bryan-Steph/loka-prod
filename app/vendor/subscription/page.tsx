'use client'
import { CreditCard } from 'lucide-react'
import { VendorComingSoon } from '@/components/vendor/VendorComingSoon'

export default function VendorSubscriptionPage() {
  return (
    <VendorComingSoon
      icon={CreditCard}
      title="Subscription"
      description="Manage your Loka subscription plan."
      badge="Coming in Sprint 7"
    />
  )
}