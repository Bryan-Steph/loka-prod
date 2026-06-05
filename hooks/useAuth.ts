'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, type AuthUser } from '@/store/authStore'

// Module-level flag — prevents concurrent refresh calls across
// multiple components mounting with useAuth() simultaneously
let refreshPromise: Promise<void> | null = null

export function useAuth() {
  const router = useRouter()
  const { accessToken, user, isLoading, isAuthenticated, setAuth, clearAuth, setLoading } =
    useAuthStore()

  const hasAttemptedRefresh = useRef(false)

  // On mount, attempt to restore session from HttpOnly cookie
  useEffect(() => {
    if (hasAttemptedRefresh.current) return
    hasAttemptedRefresh.current = true

    // If already authenticated (another component already refreshed), skip
    if (isAuthenticated) {
      setLoading(false)
      return
    }

    // Dedup: if a refresh is already in flight, wait for it
    if (refreshPromise) {
      refreshPromise.finally(() => setLoading(false))
      return
    }

    refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          clearAuth()
          return
        }
        const data = await res.json()
        if (data.token && data.user) {
          setAuth(data.token, data.user as AuthUser)
        } else {
          clearAuth()
        }
      })
      .catch(() => {
        clearAuth()
      })
      .finally(() => {
        refreshPromise = null
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      const message =
        typeof data.error === 'string'
          ? data.error
          : Object.values(data.error ?? {})[0] ?? 'Login failed'
      throw new Error(message as string)
    }

    setAuth(data.token, data.user as AuthUser)
    return data.user as AuthUser
  }

  const register = async (payload: {
    full_name: string
    email: string
    phone: string
    password: string
    role: 'buyer' | 'vendor'
    language_pref: 'en' | 'fr'
  }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      const message =
        typeof data.error === 'string'
          ? data.error
          : Object.values(data.error ?? {})[0] ?? 'Registration failed'
      throw new Error(message as string)
    }

    return data
  }

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    clearAuth()
    router.push('/login')
  }

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  }
}