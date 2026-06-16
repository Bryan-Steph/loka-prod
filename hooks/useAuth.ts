'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, type AuthUser } from '@/store/authStore'
import { isProtectedPath } from '@/lib/routes'

let refreshPromise: Promise<void> | null = null

/**
 * Returns the default post-login destination for a given role.
 * Import this in the login page component to decide where to push after login.
 *
 * @example
 * // In app/(auth)/login/page.tsx, after `const user = await login(email, pw)`:
 * router.push(getRoleRedirect(user.role, searchParams.get('next')))
 * router.refresh()
 */
export function getRoleRedirect(role: string, next?: string | null): string {
  // `next` always wins — preserves deep-link intent (e.g. user clicked a
  // product link, got bounced to login, and should land back on the product).
  if (next) return next

  if (role === 'admin')  return '/admin'
  if (role === 'vendor') return '/vendor/dashboard'
  return '/'   // buyer default
}

export function useAuth() {
  const router   = useRouter()
  const pathname = usePathname()
  const {
    accessToken, user, isLoading, isAuthenticated,
    setAuth, clearAuth, setLoading,
  } = useAuthStore()

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
          // 401 here is EXPECTED on public pages (/, /search, /products/[id],
          // etc.) — only redirect to /login if the current path actually needs
          // a session. Never redirect from /login itself (would loop).
          if (isProtectedPath(pathname)) {
            router.push('/login')
          }
          return
        }
        const data = await res.json()
        if (data.token && data.user) {
          setAuth(data.token, data.user as AuthUser)
        } else {
          clearAuth()
          if (isProtectedPath(pathname)) {
            router.push('/login')
          }
        }
      })
      .catch(() => {
        clearAuth()
        if (isProtectedPath(pathname)) {
          router.push('/login')
        }
      })
      .finally(() => {
        refreshPromise = null
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── login ─────────────────────────────────────────────────────────────────
  // Intentionally route-agnostic: returns the user object, the calling
  // component decides where to navigate (use getRoleRedirect above).
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
          : (Object.values(data.error ?? {})[0] as string) ?? 'Login failed'
      throw new Error(message)
    }

    setAuth(data.token, data.user as AuthUser)
    return data.user as AuthUser
  }

  // ── register ──────────────────────────────────────────────────────────────
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
          : (Object.values(data.error ?? {})[0] as string) ?? 'Registration failed'
      throw new Error(message)
    }

    return data
  }

  // ── logout ────────────────────────────────────────────────────────────────
  // Hard 4-second cap on the server call: clearAuth() + redirect fires
  // regardless of server response so the user is never stuck on "Signing out".
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
      // Timeout, abort, or network error — client clears state anyway.
    } finally {
      clearTimeout(timeout)
    }

    clearAuth()
    router.push('/login')
    router.refresh()   // invalidates Router Cache so stale middleware redirects don't persist
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