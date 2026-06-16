import { NextRequest, NextResponse } from 'next/server'
import { isProtectedPath } from '@/lib/routes'

// SESSION COOKIE — single source of truth: 'loka-session' (all lowercase).
// Set by:     /api/auth/login, /api/auth/refresh (on success)
// Cleared by: /api/auth/logout, /api/auth/refresh (on 401)
//
// NOTE: The proxy runs on the Edge runtime — it has NO access to the Supabase
// JWT or user role. It only knows whether a session cookie is present.
// Role-based decisions (admin vs vendor vs buyer) happen INSIDE pages/layouts.

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has('loka-session')

  // ── 1. Admin routes — MUST run before isProtectedPath ─────────────────────
  // Without this order, /admin/* would be caught by isProtectedPath and sent
  // to /login instead of /admin/login. Now admin routes always use their own
  // login page when unauthenticated.
  // /admin/login itself is excluded: the page handles the "already logged in"
  // state internally (proxy can't redirect to /admin — it doesn't know role).
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login') &&
    !hasSession
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // ── 2. Buyer / vendor / onboarding protected routes ───────────────────────
  if (isProtectedPath(pathname) && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // ── 3. Redirect authenticated users away from auth pages ──────────────────
  // /admin/login is intentionally NOT in this list — see note in block 1.
  const authPages = [
    '/login',
    '/register',
    '/register/buyer',
    '/register/vendor',
    '/sign-in',
  ]
  if (authPages.some((p) => pathname === p) && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}