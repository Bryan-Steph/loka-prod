'use client'

import { useState } from 'react'
import { LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function LogoutButton() {
  const { logout } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
    } catch {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-error font-heading text-[15px] text-error disabled:opacity-60"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <LogOut size={18} />
      )}
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}