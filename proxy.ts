import { NextRequest, NextResponse } from 'next/server'

// Routes that require authentication
const BUYER_ROUTES = /^\/buyer(\/.*)?$/
const VENDOR_ROUTES = /^\/vendor(\/.*)?$/
const ADMIN_ROUTES = /^\/admin(\/(?!login).*)?$/

// Auth routes — redirect away if already authenticated
const AUTH_ROUTES = ['/login', '/register']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read the refresh token cookie — presence indicates an active session
  // We only check existence here (Edge runtime — no JWT decode, no Supabase calls)
  const hasSession = request.cookies.has('sb-refresh-token')

  // Protect buyer routes
  if (BUYER_ROUTES.test(pathname) && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Protect vendor routes
  if (VENDOR_ROUTES.test(pathname) && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Protect admin routes (but not /admin/login itself)
  if (ADMIN_ROUTES.test(pathname) && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}