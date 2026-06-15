'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Bell, Settings, Heart,
  MessageSquare, LogOut, ChevronRight,
  Mail, Phone, ShieldCheck, Pencil,
} from 'lucide-react'
import { BottomNav } from '@/components/ui/bottom-nav'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  avatar_url: string | null
  role: string
}

const LINKS = [
  { icon: Heart,         label: 'Wishlist',       href: '/wishlist'       },
  { icon: MessageSquare, label: 'Messages',        href: '/chat'           },
  { icon: Bell,          label: 'Notifications',   href: '/notifications'  },
  { icon: Settings,      label: 'Settings',        href: '/settings'       },
]

export default function BuyerProfilePage() {
  const router                      = useRouter()
  const { user: authUser, logout }  = useAuth()
  const [profile, setProfile]       = useState<Profile | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    fetch('/api/users/me')
      .then(r => r.json())
      .then(d => { if (d.profile) setProfile(d.profile) })
      .catch(console.error)
  }, [])

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

  const name  = profile?.full_name  ?? authUser?.full_name  ?? '…'
  const email = profile?.email      ?? authUser?.email      ?? '—'
  const phone = profile?.phone      ?? authUser?.phone      ?? null

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-center border-b border-surface-3 bg-background/95 backdrop-blur">
        <span className="font-syne text-[22px] font-extrabold text-primary">LOKA</span>
      </header>

      <div className="mx-auto w-full max-w-[480px] px-4 pt-5">
        <h1 className="font-syne text-[20px] font-bold text-foreground">My Profile</h1>

        {/* Identity card */}
        <div className="mt-4 flex flex-col items-center rounded-2xl border border-surface-3 bg-surface-1 px-4 py-6">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-surface-2">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={name} className="h-full w-full object-cover" />
              : <User size={32} className="text-muted-foreground" />
            }
          </div>

          <div className="mt-3 flex items-center gap-2">
            <p className="font-syne text-[18px] font-bold text-foreground">{name}</p>
            <Link href="/settings" aria-label="Edit profile" className="text-muted-foreground">
              <Pencil size={14} />
            </Link>
          </div>
          <div className="mt-2 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <Mail size={12} className="text-muted-foreground" />
              <span className="text-[13px] text-muted-foreground">{email}</span>
            </div>
            {phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={12} className="text-muted-foreground" />
                <span className="font-mono text-[13px] text-muted-foreground">{phone}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
            <ShieldCheck size={12} className="text-primary" />
            <span className="text-[11px] font-medium text-primary">Verified Buyer</span>
          </div>
        </div>

        {/* Nav links */}
        <div className="mt-3 overflow-hidden rounded-2xl border border-surface-3 bg-surface-1">
          {LINKS.map(({ icon: Icon, label, href }, i) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex h-[52px] items-center gap-3 px-4 text-foreground transition-colors hover:bg-surface-2',
                i < LINKS.length - 1 && 'border-b border-surface-3',
              )}
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

      <BottomNav active="profile" />
    </div>
  )
}