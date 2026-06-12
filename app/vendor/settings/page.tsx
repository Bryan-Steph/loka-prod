'use client'
//app/vendor/settings/page.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  User, Store, Bell, Lock, Mail, Phone, ChevronRight,
  Pencil, Check, X, Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VendorShell } from '@/components/vendor/VendorShell'
import { useAuth } from '@/hooks/useAuth'

interface VendorInfo {
  shop_name: string
  shop_description: string | null
}

export default function VendorSettingsPage() {
  const { user } = useAuth()
  const [vendor, setVendor] = useState<VendorInfo | null>(null)

  // Shop edit state
  const [editingShop, setEditingShop] = useState(false)
  const [shopName, setShopName]       = useState('')
  const [shopDesc, setShopDesc]       = useState('')
  const [savingShop, setSavingShop]   = useState(false)
  const [shopError, setShopError]     = useState('')

  // Language preference
  const [lang, setLang]           = useState<'en' | 'fr'>('en')
  const [savingLang, setSavingLang] = useState(false)

  useEffect(() => {
    fetch('/api/vendors/me')
      .then(r => r.json())
      .then(d => {
        if (d.vendor) {
          setVendor(d.vendor)
          setShopName(d.vendor.shop_name ?? '')
          setShopDesc(d.vendor.shop_description ?? '')
        }
      })

    fetch('/api/users/me')
      .then(r => r.json())
      .then(d => { if (d.profile?.language_pref) setLang(d.profile.language_pref) })
  }, [])

  const startEditShop = () => {
    setShopName(vendor?.shop_name ?? '')
    setShopDesc(vendor?.shop_description ?? '')
    setShopError('')
    setEditingShop(true)
  }

  const cancelEditShop = () => {
    setShopName(vendor?.shop_name ?? '')
    setShopDesc(vendor?.shop_description ?? '')
    setShopError('')
    setEditingShop(false)
  }

  const saveShop = async () => {
    if (!shopName.trim()) { setShopError('Shop name cannot be empty'); return }
    setSavingShop(true); setShopError('')
    try {
      const res = await fetch('/api/vendors/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop_name: shopName.trim(),
          shop_description: shopDesc.trim() || null,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(typeof d.error === 'string' ? d.error : 'Failed to update shop')
      }
      setVendor({ shop_name: shopName.trim(), shop_description: shopDesc.trim() || null })
      setEditingShop(false)
    } catch (err) {
      setShopError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSavingShop(false)
    }
  }

  const changeLang = async (next: 'en' | 'fr') => {
    if (next === lang || savingLang) return
    const prev = lang
    setLang(next)
    setSavingLang(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language_pref: next }),
      })
      if (!res.ok) throw new Error('Failed to update language')
    } catch {
      setLang(prev) // revert on failure
    } finally {
      setSavingLang(false)
    }
  }

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
          <p className="mt-3 font-mono text-[10px] text-muted-foreground">
            To change your name, email or phone, contact LOKA support.
          </p>
        </section>

        {/* Preferences */}
        <section className="mt-3 rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <p className="font-syne text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Preferences
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Globe size={15} className="shrink-0 text-muted-foreground" />
            <p className="flex-1 text-[14px] text-foreground">Language</p>
            <div className="flex gap-2">
              {(['en', 'fr'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => changeLang(l)}
                  disabled={savingLang}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-50',
                    lang === l
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-surface-3 bg-surface-2 text-muted-foreground',
                  )}
                >
                  {l === 'en' ? 'English' : 'Français'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Shop */}
        <section className="mt-3 rounded-2xl border border-surface-3 bg-surface-1 p-4">
          <div className="flex items-center justify-between">
            <p className="font-syne text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Shop
            </p>
            {!editingShop && (
              <button
                onClick={startEditShop}
                className="flex items-center gap-1 text-[12px] font-medium text-primary"
              >
                <Pencil size={13} />
                Edit
              </button>
            )}
          </div>

          {!editingShop ? (
            <div className="mt-3 space-y-3">
              <InfoRow icon={Store} label="Shop Name"   value={vendor?.shop_name        ?? '—'} />
              <InfoRow icon={Store} label="Description" value={vendor?.shop_description ?? 'Not set'} />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1.5 block text-[12px] text-muted-foreground">Shop Name</label>
                <input
                  value={shopName}
                  maxLength={60}
                  onChange={(e) => setShopName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-surface-3 bg-surface-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] text-muted-foreground">Description</label>
                <textarea
                  value={shopDesc}
                  maxLength={200}
                  onChange={(e) => setShopDesc(e.target.value)}
                  className="h-[90px] w-full resize-none rounded-xl border border-surface-3 bg-surface-2 p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">
                  {shopDesc.length} / 200
                </p>
              </div>

              {shopError && <p className="text-xs text-error">{shopError}</p>}

              <div className="flex gap-2">
                <button
                  onClick={saveShop}
                  disabled={savingShop}
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
                >
                  <Check size={15} />
                  {savingShop ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEditShop}
                  disabled={savingShop}
                  className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-surface-3 text-[13px] text-foreground disabled:opacity-60"
                >
                  <X size={15} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Links */}
        <section className="mt-3 rounded-2xl border border-surface-3 bg-surface-1 p-1">
          <NavRow icon={Bell} label="Notification Preferences" href="/vendor/notifications" />
          <NavRow icon={Lock} label="Change Password"          href="/forgot-password" />
        </section>

        <p className="mt-6 text-center font-mono text-[10px] text-muted-foreground">
          LOKA ·n ·
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