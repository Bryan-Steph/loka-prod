'use client'

import Link from 'next/link'
import {
  Settings,
  User,
  Camera,
  Pencil,
  ShoppingBag,
  MessageSquare,
  Heart,
  Shield,
  CreditCard,
  Bell,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { BottomNav } from '@/components/buyer/BottomNav'
import { ActivityItem, type PickupStatus } from '@/components/buyer/ActivityItem'

const STATS = [
  { icon: ShoppingBag, value: '3', label: 'Purchases' },
  { icon: MessageSquare, value: '2', label: 'Bargains' },
  { icon: Heart, value: '8', label: 'Saved' },
]

const ACTIVITY: {
  product: string
  vendor: string
  date: string
  amount: string
  status: PickupStatus
}[] = [
  {
    product: 'Samsung Galaxy A32',
    vendor: 'Mama Agnes Electronics',
    date: '12 May 2026',
    amount: '40,500 XAF',
    status: 'PICKED UP',
  },
  {
    product: 'JBL-style Speaker',
    vendor: 'Tech Corner',
    date: '8 May 2026',
    amount: '11,500 XAF',
    status: 'PICKED UP',
  },
  {
    product: 'Ankara Print Fabric',
    vendor: 'Fabrics Palace',
    date: '2 Jun 2026',
    amount: '4,500 XAF',
    status: 'PENDING PICKUP',
  },
]

const ACCOUNT_LINKS = [
  { icon: Shield, label: 'Privacy & Security' },
  { icon: CreditCard, label: 'Payment History', value: '3 transactions' },
  { icon: Bell, label: 'Notification Preferences' },
  { icon: Globe, label: 'Language: English', value: 'EN | FR' },
  { icon: HelpCircle, label: 'Help & Support' },
]

export default function ProfilePage() {
  return (
    <div className="mx-auto min-h-dvh max-w-[480px] space-y-4 bg-background pb-24">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-surface-3 bg-surface-1 px-4 py-3.5">
        <h1 className="font-heading text-xl text-foreground">My Profile</h1>
        <Link href="/settings" aria-label="Settings" className="text-muted-foreground">
          <Settings size={22} />
        </Link>
      </header>

      {/* Profile header card */}
      <div className="mx-4 flex flex-col items-center rounded-2xl border border-surface-3 bg-surface-1 p-5">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-2">
            <User size={36} className="text-muted-foreground" />
          </div>
          <button
            aria-label="Edit photo"
            className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary"
          >
            <Camera size={14} className="text-primary-foreground" />
          </button>
        </div>
        <p className="mt-3 font-heading text-xl text-foreground">Nkeng Alain</p>
        <p className="font-mono text-[13px] text-muted-foreground">
          +237 674 528 557
        </p>
        <p className="text-xs text-muted-foreground">nkeng.alain@gmail.com</p>
        <button className="mt-3 flex h-10 w-[120px] items-center justify-center gap-1.5 rounded-xl border border-primary text-[13px] text-primary">
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>

      {/* Stats row */}
      <div className="mx-4 grid grid-cols-3 gap-2.5">
        {STATS.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-3"
            >
              <Icon size={20} className="text-primary" />
              <span className="font-mono text-2xl text-primary">{s.value}</span>
              <span className="text-[11px] text-muted-foreground">
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Recent activity */}
      <div className="mx-4 overflow-hidden rounded-2xl border border-surface-3 bg-surface-1">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="font-heading text-sm text-foreground">
            Recent Activity
          </h2>
          <button className="text-xs text-primary">View all →</button>
        </div>
        <div className="border-t border-surface-3">
          {ACTIVITY.map((a, i) => (
            <ActivityItem
              key={a.product}
              {...a}
              last={i === ACTIVITY.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Account section */}
      <div className="mx-4 overflow-hidden rounded-2xl border border-surface-3 bg-surface-1">
        {ACCOUNT_LINKS.map((link, i) => {
          const Icon = link.icon
          return (
            <button
              key={link.label}
              className="flex h-[52px] w-full items-center gap-3 px-4 text-left active:bg-surface-2"
              style={{
                borderBottom:
                  i === ACCOUNT_LINKS.length - 1
                    ? undefined
                    : '1px solid var(--surface-3)',
              }}
            >
              <Icon size={18} className="text-muted-foreground" />
              <span className="flex-1 text-sm text-foreground">
                {link.label}
              </span>
              {link.value ? (
                <span className="font-mono text-[10px] text-primary">
                  {link.value}
                </span>
              ) : null}
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          )
        })}
      </div>

      {/* Sign out */}
      <div className="px-4">
        <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-error font-heading text-sm text-error">
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <BottomNav active="profile" />
    </div>
  )
}
