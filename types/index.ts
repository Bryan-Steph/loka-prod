// ─── Profile (mirrors Supabase profiles table) ────────────────────────────────
export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  role: 'buyer' | 'vendor' | 'admin'
  language_pref: 'en' | 'fr'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  created_at: string
}

// ─── Shop (vendor storefront) ─────────────────────────────────────────────────
export interface Shop {
  id: string
  vendor_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  location: string | null
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface Product {
  id: string
  shop_id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  price: number          // always in FCFA
  compare_at_price: number | null
  images: string[]       // Cloudinary URLs
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  // joined relations (optional — present when query uses .select('*, shop(*), category(*)'))
  shop?: Shop
  category?: Category
}

// ─── Cart (client-side only — not persisted to DB in Sprint 1) ────────────────
export interface CartItem {
  product_id: string
  quantity: number
  product?: Product
}

export interface Cart {
  items: CartItem[]
  total: number
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  product?: Product
}

export interface Order {
  id: string
  buyer_id: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_reference: string | null  // Fapshi transId
  subtotal: number
  delivery_fee: number
  total: number
  delivery_address: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

// ─── Fapshi ───────────────────────────────────────────────────────────────────
export interface FapshiPaymentInit {
  amount: number
  email: string
  redirectUrl?: string
  userId?: string
  externalId?: string
  message?: string
}

export interface FapshiPaymentStatus {
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING'
  transId: string
  amount: number
}

// ─── Africa's Talking SMS ─────────────────────────────────────────────────────
export interface SMSPayload {
  to: string   // E.164 format e.g. +237674528557
  message: string
}

// ─── Product search / filter ──────────────────────────────────────────────────
export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  shopId?: string
  search?: string
  featured?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
}

// ─── API helpers ──────────────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string | Record<string, string>
  status?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}