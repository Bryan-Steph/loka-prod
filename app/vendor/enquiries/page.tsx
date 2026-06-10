'use client'
import { MessageSquare } from 'lucide-react'
import { VendorComingSoon } from '@/components/vendor/VendorComingSoon'

export default function VendorEnquiriesPage() {
  return (
    <VendorComingSoon
      icon={MessageSquare}
      title="Enquiries"
      description="Buyer bargain requests will appear here."
      badge="Coming in Sprint 4"
    />
  )
}