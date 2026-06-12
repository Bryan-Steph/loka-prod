import { NextRequest, NextResponse } from 'next/server'

// ── NOTE ON ROUTE GROUPS ────────────────────────────────────────────────────
// app/(buyer)/feed/page.tsx  → real URL: /feed     (NOT /buyer/feed)
// app/(buyer)/chat/page.tsx  → real URL: /chat     (NOT /buyer/chat)
// app/(buyer)/profile/page.tsx → real URL: /profile
// app/(onboarding)/shop/page.tsx → real URL: /shop
// Vendor routes stay at /vendor/* (no route group, so URL matches)
// ───────────────────────────────────────────────────────────────────────────

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
// Accept both casings — 'Loka-session' is what the current login route sets
const hasSession =
  request.cookies.has('loka-session') || request.cookies.has('Loka-session')

  // ── Routes that require a session ───────────────────────────────────────
  const isProtected =
    // Vendor portal
    pathname.startsWith('/vendor') ||
    // Buyer pages (route group strips the (buyer) prefix)
    pathname === '/feed' ||
    pathname.startsWith('/chat') ||
    pathname === '/profile' ||
    pathname === '/notifications' ||
    pathname === '/settings' ||
    pathname === '/wishlist' ||
    // Vendor onboarding steps (route group strips (onboarding) prefix)
    pathname === '/account' ||
    pathname === '/shop' ||        // onboarding step 2 (NOT /shop/:id which is public)
    pathname === '/location' ||
    pathname === '/identity'

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // ── Admin routes ─────────────────────────────────────────────────────────
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login') &&
    !hasSession
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // ── Redirect authenticated users away from auth pages ────────────────────
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