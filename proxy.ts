import { NextRequest, NextResponse } from 'next/server'

// ── NOTE ON ROUTE GROUPS ────────────────────────────────────────────────────
// app/(buyer)/feed/page.tsx      → real URL: /feed     (NOT /buyer/feed)
// app/(buyer)/chat/page.tsx      → real URL: /chat     (NOT /buyer/chat)
// app/(buyer)/profile/page.tsx   → real URL: /profile
// app/(onboarding)/shop/page.tsx → real URL: /shop
// Vendor routes stay at /vendor/* (no route group, so URL matches)
// ───────────────────────────────────────────────────────────────────────────
//
// SESSION COOKIE — single source of truth: 'loka-session' (all lowercase).
// Set by:     /api/auth/login, /api/auth/refresh (on success)
// Cleared by: /api/auth/logout, /api/auth/refresh (on 401)
// All three routes MUST use this exact casing. Do not reintroduce 'Loka-session'.

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has('loka-session')

  const isProtected =
    pathname.startsWith('/vendor') ||
    pathname === '/feed' ||
    pathname.startsWith('/chat') ||
    pathname === '/profile' ||
    pathname === '/notifications' ||
    pathname === '/settings' ||
    pathname === '/wishlist' ||
    pathname === '/account' ||
    pathname === '/shop' ||
    pathname === '/location' ||
    pathname === '/identity'

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login') &&
    !hasSession
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  const authPages = ['/login', '/register', '/register/buyer', '/register/vendor', '/sign-in']
  if (authPages.some(p => pathname === p) && hasSession) {
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