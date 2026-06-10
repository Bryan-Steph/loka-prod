import { NextRequest, NextResponse } from 'next/server'

const BUYER_ROUTES = /^\/buyer(\/.*)?$/
const VENDOR_ROUTES = /^\/vendor(\/.*)?$/
const ADMIN_ROUTES = /^\/admin(\/(?!login).*)?$/
const AUTH_ROUTES = ['/login', '/register']

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
const hasSession = request.cookies.has('Shopsy-session')  // was: 'sb-refresh-token'
  if (BUYER_ROUTES.test(pathname) && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (VENDOR_ROUTES.test(pathname) && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (ADMIN_ROUTES.test(pathname) && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && hasSession) {
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