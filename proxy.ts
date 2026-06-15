import { NextRequest, NextResponse } from 'next/server'
import { isProtectedPath } from '@/lib/routes'

// SESSION COOKIE — single source of truth: 'loka-session' (all lowercase).
// Set by:     /api/auth/login, /api/auth/refresh (on success)
// Cleared by: /api/auth/logout, /api/auth/refresh (on 401)

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has('loka-session')

  if (isProtectedPath(pathname) && !hasSession) {
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