'use client'

//app/vendor/profile/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Store, Camera, Package, Eye, MessageSquare,
  Settings, CreditCard, ShieldCheck, Clock, ShieldAlert,
  ChevronRight, LogOut, Bell,
} from 'lucide-react'
import { VendorShell } from '@/components/vendor/VendorShell'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useAuth } from '@/hooks/useAuth'

interface VendorData {
  shop_name: string
  shop_avatar_url: string | null
  verification_status: 'pending' | 'approved' | 'rejected' | string | null
}
interface Stats { activeProducts: number; totalViews: number; enquiries: number }

const LINKS = [
  { icon: Store,      label: 'My Shop',       href: '/vendor/shop'         },
  { icon: Package,    label: 'Products',      href: '/vendor/products'     },
  { icon: CreditCard, label: 'Subscription',  href: '/vendor/subscription' },
  { icon: Bell,       label: 'Notifications', href: '/vendor/notifications'},
  { icon: Settings,   label: 'Settings',      href: '/vendor/settings'     },
]

export default function VendorProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const [vendor, setVendor]           = useState<VendorData | null>(null)
  const [stats, setStats]             = useState<Stats | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [loggingOut, setLoggingOut]   = useState(false)

  useEffect(() => {
    fetch('/api/vendors/me')
      .then(r => r.json())
      .then(d => { if (d.vendor) setVendor(d.vendor) })
    fetch('/api/vendors/me/stats')
      .then(r => r.json())
      .then(d => { if (d.stats) setStats(d.stats) })
  }, [])

  const handleAvatarUpload = async (url: string) => {
    setUploadError('')
    const res = await fetch('/api/vendors/me', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ shop_avatar_url: url }),
    })
    if (res.ok) {
      setVendor(v => v ? { ...v, shop_avatar_url: url } : v)
    } else {
      setUploadError('Failed to save photo — try again')
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      router.push('/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  const status   = vendor?.verification_status
  const verified = status === 'approved'
  const rejected = status === 'rejected'
  const chip = verified
    ? { Icon: ShieldCheck, text: 'Verified Vendor',        cls: 'text-success bg-success/10'  }
    : rejected
      ? { Icon: ShieldAlert, text: 'Verification Rejected', cls: 'text-error bg-error/10'      }
      : { Icon: Clock,       text: 'Verification Pending',  cls: 'text-primary bg-primary/10'  }

  return (
    <VendorShell>
      <div className="mx-auto w-full max-w-[640px] px-4 pb-10 pt-5">
        <h1 className="font-syne text-[20px] font-bold text-foreground">My Profile</h1>

        {/* Identity card */}
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-surface-3 bg-surface-1 p-6">

          {/* ── Avatar + upload trigger ─────────────────────────────────
              FIX: ImageUpload is positioned as the camera button container.
              Children use <span> (phrasing content) — valid inside <button>.
              <button><span> has zero nesting errors in all browsers / React.
              ──────────────────────────────────────────────────────────── */}
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-surface-2">
              {vendor?.shop_avatar_url
                ? <img src={vendor.shop_avatar_url} alt="Shop avatar" className="h-full w-full object-cover" />
                : <Store size={28} className="text-muted-foreground" />
              }
            </div>

            <ImageUpload
              folder="Loka/shop_avatars"
              onUpload={handleAvatarUpload}
              onError={setUploadError}
              className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-full"
            >
              {/* <span> not <button> — avoids <button><button> nesting */}
              <span className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary">
                <Camera size={14} className="text-primary-foreground" />
              </span>
            </ImageUpload>
          </div>

          {uploadError && (
            <p className="mt-2 text-[11px] text-error">{uploadError}</p>
          )}

          <p className="mt-3 font-syne text-[18px] font-bold text-foreground">
            {vendor?.shop_name ?? user?.full_name ?? '…'}
          </p>
          <p className="text-[13px] text-muted-foreground">{user?.email ?? '—'}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{user?.phone ?? '—'}</p>

          <div className={`mt-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${chip.cls}`}>
            <chip.Icon size={12} />
            {chip.text}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: Package,       value: stats?.activeProducts, label: 'Products'  },
            { icon: Eye,           value: stats?.totalViews,     label: 'Views'     },
            { icon: MessageSquare, value: stats?.enquiries,      label: 'Enquiries' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 rounded-xl bg-surface-2 py-3">
              <Icon size={18} className="text-primary" />
              <span className="font-mono text-[22px] text-primary">{value ?? '—'}</span>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Nav links */}
        <div className="mt-3 overflow-hidden rounded-2xl border border-surface-3 bg-surface-1">
          {LINKS.map(({ icon: Icon, label, href }, i) => (
            <Link
              key={href}
              href={href}
              className={`flex h-[52px] items-center gap-3 px-4 text-foreground transition-colors hover:bg-surface-2${i < LINKS.length - 1 ? ' border-b border-surface-3' : ''}`}
            >
              <Icon size={17} className="shrink-0 text-muted-foreground" />
              <span className="flex-1 text-[14px]">{label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-error/30 text-[14px] font-medium text-error disabled:opacity-60"
        >
          <LogOut size={16} />
          {loggingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </VendorShell>
  )
}