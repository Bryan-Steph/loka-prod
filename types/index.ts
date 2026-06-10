// ─── Enums — match migration 001 exactly ─────────────────────────────────────

export type UserRole = 'buyer' | 'vendor' | 'admin'
export type LanguagePref = 'en' | 'fr'

// migration 001: verification_status
export type VendorVerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

// migration 001: product_condition
export type ProductCondition = 'new' | 'used_good' | 'used_fair' | 'refurbished'

// migration 001: stock_status
export type StockStatus = 'in_stock' | 'out_of_stock' | 'on_order'

// migration 001: transaction_status
export type TransactionStatus =
  | 'pending'
  | 'funded'
  | 'confirmed'
  | 'released'
  | 'disputed'
  | 'refunded'
  | 'expired'

// migration 001: bargain_status
export type BargainStatus = 'pending' | 'accepted' | 'countered' | 'declined' | 'expired'

// migration 001: subscription_status
export type SubscriptionStatus = 'active' | 'grace_period' | 'expired' | 'cancelled'

// migration 001: report_type
export type ReportType = 'listing' | 'vendor' | 'message'

// migration 001: notification_type
export type NotificationType =
  | 'bargain_offer'
  | 'bargain_accepted'
  | 'bargain_declined'
  | 'payment_confirmed'
  | 'pickup_code'
  | 'new_product_followed'
  | 'price_drop'
  | 'subscription_expiry'
  | 'verification_approved'
  | 'dispute_update'

// ─── Table shapes — column names match the migrations exactly ─────────────────

export interface DbUser {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  language_pref: LanguagePref
  notif_bargains: boolean
  notif_new_products: boolean
  notif_price_drops: boolean
  created_at: string
  updated_at: string
  // NOTE: email is NOT in public.users — it lives in auth.users
}

export interface DbCategory {
  id: string
  parent_id: string | null
  name_en: string
  name_fr: string | null
  icon_emoji: string | null
  sort_order: number
}

export interface DbVendor {
  id: string
  user_id: string                           // FK → public.users.id
  shop_name: string
  shop_description: string | null
  shop_avatar_url: string | null
  category_id: string | null
  latitude: number | null
  longitude: number | null
  address_text: string | null
  verification_status: VendorVerificationStatus
  verified_at: string | null
  verified_by: string | null
  is_active: boolean
  last_seen_at: string | null
  total_views: number
  report_count: number
  suspension_reason: string | null
  created_at: string
  updated_at: string
}

export interface DbProduct {
  id: string
  vendor_id: string
  category_id: string | null
  name_en: string
  name_fr: string | null
  description_en: string | null
  description_fr: string | null
  price: number                             // XAF integer, never decimals
  condition: ProductCondition
  stock_status: StockStatus
  bargaining_allowed: boolean
  photo_urls: string[]                      // Cloudinary URLs, first = cover
  view_count: number
  is_published: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface DbConversation {
  id: string
  buyer_id: string
  vendor_id: string
  product_id: string
  last_message_at: string | null
  last_message_preview: string | null
  buyer_unread_count: number
  vendor_unread_count: number
  created_at: string
}

export interface DbMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string | null
  bargain_offer_id: string | null
  is_read: boolean
  created_at: string
}

export interface DbBargainOffer {
  id: string
  conversation_id: string
  product_id: string
  buyer_id: string
  vendor_id: string
  offered_price: number                     // XAF integer
  counter_price: number | null              // XAF integer
  status: BargainStatus
  expires_at: string
  created_at: string
  updated_at: string
}

export interface DbTransaction {
  id: string
  buyer_id: string
  vendor_id: string
  product_id: string
  bargain_offer_id: string | null
  agreed_price: number                      // XAF integer
  Shopsy_fee: number                          // XAF integer (2%)
  total_charged: number                     // agreed_price + Shopsy_fee
  status: TransactionStatus
  fapshi_reference: string | null
  payment_method: string | null
  pickup_code_hash: string | null           // bcrypt hash — NEVER returned in API responses
  pickup_attempts: number
  funded_at: string | null
  auto_release_at: string | null
  confirmed_at: string | null
  released_at: string | null
  dispute_reason: string | null
  admin_note: string | null
  created_at: string
}

export interface DbNotification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  action_url: string | null
  is_read: boolean
  sms_sent: boolean
  created_at: string
}

export interface DbSubscriptionPlan {
  id: string
  name: string
  price_xaf: number
  max_products: number
  description: string | null
  is_active: boolean
  sort_order: number
}

export interface DbSubscription {
  id: string
  vendor_id: string
  plan_id: string
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  grace_period_end: string | null
  fapshi_reference: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export interface DbVerificationDocument {
  id: string
  vendor_id: string
  storage_path: string
  document_type: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_note: string | null
  file_deleted: boolean
  created_at: string
}

export interface DbVendorFollow {
  id: string
  buyer_id: string
  vendor_id: string
  created_at: string
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string | Record<string, string>
  code?: string
}

export interface AuthResponse {
  token: string
  user: import('@/store/authStore').AuthUser
}