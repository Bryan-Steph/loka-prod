'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Store, Bell, Lock, Mail, Phone, ChevronRight } from 'lucide-react'
import { VendorShell } from '@/components/vendor/VendorShell'
import { useAuth } from '@/hooks/useAuth'

interface VendorInfo {
  shop_name: string
  shop_description: string | null
}

export default function VendorSettingsPage() {
  const { user } = useAuth()
  const [vendor, setVendor] = useState<VendorInfo | null>(null)

  useEffect(() => {
    fetch('/api/vendors/me')
      .then(r => r.json())
      .then(d => { if (d.vendor) setVendor(d.vendor) })
  }, [])

  return (
    <VendorShell>
      <div className="mx-auto w-full max-w-[640px] px-4 pb-10 pt-5">
        <h1 className="font-syne text-[20px] font-bold text-foreground">Settings</h1>

        {/* Profile */}
        <section className="mt-4 rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <p className="font-syne text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Profile
          </p>
          <div className="mt-3 space-y-3">
            <InfoRow icon={User}  label="Full Name" value={user?.full_name ?? '—'} />
            <InfoRow icon={Mail}  label="Email"     value={user?.email     ?? '—'} />
            <InfoRow icon={Phone} label="Phone"     value={user?.phone     ?? '—'} />
          </div>
        </section>

        {/* Shop */}
        <section className="mt-3 rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <p className="font-syne text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Shop
          </p>
          <div className="mt-3 space-y-3">
            <InfoRow icon={Store} label="Shop Name"   value={vendor?.shop_name        ?? '—'} />
            <InfoRow icon={Store} label="Description" value={vendor?.shop_description ?? 'Not set'} />
          </div>
        </section>

        {/* Links */}
        <section className="mt-3 rounded-2xl border border-surface-3 bg-surface-1 p-1">
          <NavRow icon={Bell} label="Notification Preferences" href="/vendor/notifications" />
          <NavRow icon={Lock} label="Change Password"          href="/forgot-password" />
        </section>

        <p className="mt-6 text-center font-mono text-[10px] text-muted-foreground">
          Shopsy · BSc Dissertation · COLTECH 2025/2026
        </p>
      </div>
    </VendorShell>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-[14px] text-foreground">{value}</p>
      </div>
    </div>
  )
}

function NavRow({ icon: Icon, label, href }: { icon: typeof User; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex h-12 items-center gap-3 rounded-xl px-3 text-foreground transition-colors hover:bg-surface-2"
    >
      <Icon size={15} className="shrink-0 text-muted-foreground" />
      <span className="flex-1 text-[14px]">{label}</span>
      <ChevronRight size={15} className="text-muted-foreground" />
    </Link>
  )
}