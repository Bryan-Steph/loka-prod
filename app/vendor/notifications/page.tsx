'use client'
import { Bell } from 'lucide-react'
import { VendorComingSoon } from '@/components/vendor/VendorComingSoon'

export default function VendorNotificationsPage() {
  return (
    <VendorComingSoon
      icon={Bell}
      title="Notifications"
      description="Activity alerts and push notifications."
      badge="Coming in Sprint 7"
    />
  )
}