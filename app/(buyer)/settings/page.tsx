'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Lock,
  Globe,
  MessageSquare,
  Package,
  TrendingDown,
  Shield,
  EyeOff,
  Ban,
  HelpCircle,
  AlertTriangle,
  FileText,
  Info,
  Trash2,
  LogOut,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BottomNav } from '@/components/buyer/BottomNav'
import { SettingsSection } from '@/components/ui/SettingsSection'
import { SettingsRow, Toggle } from '@/components/ui/SettingsRow'
function useLanguage() {
  // Minimal in-file language hook to avoid the missing module error.
  // This persists the choice to localStorage so it's stable across reloads.
  const [lang, setLang] = useState<'en' | 'fr'>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('loka_lang') : null
      return stored === 'fr' ? 'fr' : 'en'
    } catch {
      return 'en'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('loka_lang', lang)
    } catch {
      // ignore storage errors
    }
  }, [lang])

  return { lang, setLang }
}

interface Profile {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  avatar_url: string | null
  role: string
  language_pref: 'en' | 'fr'
}

type EditField = 'full_name' | 'phone' | null

function LangChips() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-0.5">
      {(['en', 'fr'] as const).map((l) => (
        <button
          key={l}
          onClick={(e) => {
            e.stopPropagation()
            setLang(l)
          }}
          className={cn(
            'rounded-md px-2 py-1 font-mono text-[11px]',
            lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const [bargainOffers, setBargainOffers] = useState(true)
  const [newProducts, setNewProducts] = useState(true)
  const [priceDrops, setPriceDrops] = useState(false)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [profile, setProfile]       = useState<Profile | null>(null)

  const [editField, setEditField]   = useState<EditField>(null)
  const [editValue, setEditValue]   = useState('')
  const [saving, setSaving]         = useState(false)
  const [editError, setEditError]   = useState('')

  const router = useRouter()
  const { logout } = useAuth()

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

  const openEdit = (field: EditField) => {
    if (!profile || !field) return
    setEditField(field)
    setEditValue(field === 'full_name' ? (profile.full_name ?? '') : (profile.phone ?? ''))
    setEditError('')
  }

  const saveEdit = async () => {
    if (!editField) return
    setSaving(true)
    setEditError('')
    try {
      const res = await fetch('/api/users/me', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ [editField]: editValue }),
      })
      const d = await res.json()
      if (!res.ok) {
        setEditError(typeof d.error === 'string' ? d.error : 'Failed to save')
        return
      }
      setProfile(d.profile)
      setEditField(null)
    } catch {
      setEditError('Network error — try again')
    } finally {
      setSaving(false)
    }
  }

  const fullName = profile?.full_name ?? '…'
  const phone    = profile?.phone ?? '—'
  const email    = profile?.email ?? '—'

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] space-y-5 bg-background pb-24">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-surface-3 bg-surface-1 px-4 py-3.5">
        <Link href="/profile" aria-label="Back" className="text-foreground">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="flex-1 text-center font-heading text-xl text-foreground">
          Settings
        </h1>
        <div className="w-[22px]" />
      </header>

      <SettingsSection label="Account">
        <SettingsRow icon={User} label="Full Name" value={fullName} onClick={() => openEdit('full_name')} />
        <SettingsRow
          icon={Phone}
          label="Phone Number"
          value={phone}
          valueClassName="font-mono"
          onClick={() => openEdit('phone')}
        />
        <SettingsRow
          icon={Mail}
          label="Email Address"
          value={email}
          showChevron={false}
        />
        <SettingsRow icon={Lock} label="Change Password" />
        <SettingsRow
          icon={Globe}
          label="Language"
          control={<LangChips />}
          last
        />
      </SettingsSection>

      <SettingsSection label="Notifications">
        <SettingsRow
          icon={MessageSquare}
          label="Bargain Offers"
          control={<Toggle on={bargainOffers} onChange={setBargainOffers} />}
        />
        <SettingsRow
          icon={Package}
          label="New Products from Followed Vendors"
          control={<Toggle on={newProducts} onChange={setNewProducts} />}
        />
        <SettingsRow
          icon={TrendingDown}
          label="Price Drop Alerts"
          control={<Toggle on={priceDrops} onChange={setPriceDrops} />}
        />
        <SettingsRow
          icon={Phone}
          label="SMS Alerts (critical only)"
          control={<Toggle on={smsAlerts} onChange={setSmsAlerts} />}
          last
        />
        <p className="px-4 pb-3 font-mono text-[9px] text-muted-foreground">
          SMS alerts sent for: payment confirmations, pickup codes, bargain
          acceptances.
        </p>
      </SettingsSection>

      <SettingsSection label="Privacy & Security">
        <SettingsRow
          icon={Shield}
          label="Two-Factor Authentication"
          value="OFF"
          valueClassName="font-mono text-error"
        />
        <SettingsRow
          icon={EyeOff}
          label="Profile Visibility"
          value="Public"
          valueClassName="font-mono text-primary"
        />
        <SettingsRow
          icon={Ban}
          label="Blocked Vendors"
          value="0 blocked"
          valueClassName="font-mono"
          last
        />
      </SettingsSection>

      <SettingsSection label="Support">
        <SettingsRow icon={HelpCircle} label="Help Center" />
        <SettingsRow icon={MessageSquare} label="Contact Loka Support" />
        <SettingsRow icon={AlertTriangle} label="Report a Problem" last />
      </SettingsSection>

      <SettingsSection label="About">
        <SettingsRow icon={FileText} label="Terms of Service" />
        <SettingsRow icon={Shield} label="Privacy Policy" />
        <SettingsRow
          icon={Info}
          label="App Version"
          value="v1.0.0 · Loka.cm"
          valueClassName="font-mono"
          showChevron={false}
          last
        />
      </SettingsSection>

      <SettingsSection label="Danger Zone" danger>
        <SettingsRow
          icon={Trash2}
          label="Delete Account"
          value="Permanent"
          valueClassName="font-mono text-error/70"
          danger
          showChevron={false}
          onClick={() => setShowDelete(true)}
          last
        />
      </SettingsSection>

      <div className="px-4">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-error/30 text-[14px] font-medium text-error disabled:opacity-60"
        >
          <LogOut size={16} />
          {loggingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>

      {/* Edit field bottom sheet */}
      {editField && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div className="w-full max-w-[480px] rounded-t-2xl border-t border-surface-3 bg-surface-1 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg text-foreground">
                {editField === 'full_name' ? 'Edit Full Name' : 'Edit Phone Number'}
              </h2>
              <button onClick={() => setEditField(null)} aria-label="Close" className="text-muted-foreground">
                <X size={20} />
              </button>
            </div>
            <input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={editField === 'phone' ? '+237 6XX XXX XXX' : 'Your name'}
              className="h-12 w-full rounded-xl border border-surface-3 bg-surface-2 px-4 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            {editError && <p className="mt-2 text-[12px] text-error">{editError}</p>}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditField(null)}
                className="h-12 flex-1 rounded-xl border border-surface-3 text-sm text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-heading text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation bottom sheet */}
      {showDelete ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
          <div className="w-full max-w-[480px] animate-Loka-fade-up rounded-t-2xl border-t border-surface-3 bg-surface-1 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg text-error">Delete Account?</h2>
              <button
                onClick={() => setShowDelete(false)}
                aria-label="Close"
                className="text-muted-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              This permanently deletes your Loka account, chats, bargains and
              wishlist. This action cannot be undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowDelete(false)}
                className="h-12 flex-1 rounded-xl border border-surface-3 text-sm text-foreground"
              >
                Cancel
              </button>
              <button className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-error font-heading text-sm font-semibold text-foreground">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <BottomNav active="profile" />
    </div>
  )
}