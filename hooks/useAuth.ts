'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, type AuthUser } from '@/store/authStore'

let refreshPromise: Promise<void> | null = null

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const { accessToken, user, isLoading, isAuthenticated, setAuth, clearAuth, setLoading } =
    useAuthStore()

  const hasAttemptedRefresh = useRef(false)

  useEffect(() => {
    if (hasAttemptedRefresh.current) return
    hasAttemptedRefresh.current = true

    if (isAuthenticated) {
      setLoading(false)
      return
    }

    if (refreshPromise) {
      refreshPromise.finally(() => setLoading(false))
      return
    }

    refreshPromise = fetch('/api/auth/refresh', {
      method:      'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          clearAuth()
          // Don't redirect if already on /login — avoids a self-loop.
          // 401 here is EXPECTED on /login when there's no session.
          if (pathname !== '/login') {
            router.push('/login')
          }
          return
        }
        const data = await res.json()
        if (data.token && data.user) {
          setAuth(data.token, data.user as AuthUser)
        } else {
          clearAuth()
          if (pathname !== '/login') {
            router.push('/login')
          }
        }
      })
      .catch(() => {
        clearAuth()
        if (pathname !== '/login') {
          router.push('/login')
        }
      })
      .finally(() => {
        refreshPromise = null
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ email, password }),
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
    full_name:     string
    email:         string
    phone:         string
    password:      string
    role:          'buyer' | 'vendor'
    language_pref: 'en' | 'fr'
  }) => {
    const res = await fetch('/api/auth/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
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

  // Logout is defensive: a hung /api/auth/logout request (slow mobile
  // network, a rate-limit/Redis call without a fast fallback, etc.) must
  // NEVER leave the user stuck on "Signing out...". The server call gets a
  // hard 4-second cap; client state is cleared and the redirect fires
  // regardless of the server outcome. If the server call times out, the
  // httpOnly session cookie simply expires naturally (7-day maxAge) rather
  // than being cleared immediately — acceptable for this stage.
  const logout = async () => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 4000)

    try {
      await fetch('/api/auth/logout', {
        method:      'POST',
        credentials: 'include',
        signal:      controller.signal,
      })
    } catch {
      // Timed out, aborted, or network error — proceed anyway.
    } finally {
      clearTimeout(timeout)
    }

    clearAuth()
    router.push('/login')
    // Bust the Router Cache so cached middleware redirects computed while
    // authenticated (or unauthenticated) aren't reused after this transition.
    router.refresh()
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