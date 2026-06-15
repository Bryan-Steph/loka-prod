// lib/routes.ts
//
// Route groups strip their prefix from the URL:
//   app/(buyer)/feed/page.tsx      → /feed
//   app/(onboarding)/shop/page.tsx → /shop
//   app/vendor/dashboard/page.tsx  → /vendor/dashboard  (no group, stays as-is)
//
// Always import from here instead of hardcoding paths.

export const ROUTES = {
  home:     '/',
  search:   '/search',
  login:    '/login',
  register: '/register',

  onboarding: {
    account:  '/account',
    shop:     '/shop',
    location: '/location',
    identity: '/identity',
  },

  buyer: {
    feed:          '/feed',
    chat:          '/chat',
    chatThread:    (id: string) => `/chat/${id}`,
    wishlist:      '/wishlist',
    profile:       '/profile',
    settings:      '/settings',
    notifications: '/notifications',
  },

  vendor: {
    dashboard:     '/vendor/dashboard',
    profile:       '/vendor/profile',
    products:      '/vendor/products',
    newProduct:    '/vendor/products/new',
    editProduct:   (id: string) => `/vendor/products/${id}/edit`,
    shop:          '/vendor/shop',
    enquiries:     '/vendor/enquiries',
    subscription:  '/vendor/subscription',
    settings:      '/vendor/settings',
    notifications: '/vendor/notifications',
  },
} as const

// ── Route protection — single source of truth for proxy.ts AND useAuth.ts ──
const PROTECTED_EXACT = [
  '/vendor', '/feed', '/chat', '/profile', '/notifications',
  '/settings', '/wishlist', '/account', '/shop', '/location', '/identity',
]

// Prefixes use a trailing slash so '/vendor/' does NOT match '/vendors/...'
const PROTECTED_PREFIXES = ['/vendor/', '/chat/']

export function isProtectedPath(pathname: string): boolean {
  if (PROTECTED_EXACT.includes(pathname)) return true
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
}