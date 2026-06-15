import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseAdminAuth } from '@supabase/supabase-js'

const PHOTOS = {
  electronics: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80',
    'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=600&q=80',
  ],
  fashion: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
    'https://images.unsplash.com/photo-1525562723836-dca67a71d5f1?w=600&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
  ],
  produce: [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80',
    'https://images.unsplash.com/photo-1518843875459-f738682238a6?w=600&q=80',
  ],
  beauty: [
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
  ],
}

const AVATARS = {
  manA:   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
  womanA: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80',
  manB:   'https://images.unsplash.com/photo-1542178243-bc20204b769f?w=300&q=80',
  womanB: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&q=80',
  manC:   'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=300&q=80',
}

interface SeedVendor {
  email: string
  password: string
  full_name: string
  phone: string
  shop_name: string
  shop_description: string
  address_text: string
  avatarUrl: string
  categorySlug: string
  products: { name: string; price: number; desc: string; photos: string[]; bargain: boolean; condition: 'new' | 'used' | 'refurbished' }[]
}

const VENDOR_PRODUCTS: SeedVendor[] = [
  {
    email: 'techhub@loka.cm',
    password: 'Loka@2025!',
    full_name: 'Jean-Paul Nguemo',
    phone: '+237677000001',
    shop_name: 'TechHub Bamenda',
    shop_description: 'Quality phones, laptops, and accessories at the best prices in Bamenda. All products tested before sale.',
    address_text: 'Commercial Avenue, Shed 7, Bamenda',
    avatarUrl: AVATARS.manA,
    categorySlug: 'electronics',
    products: [
      { name: 'Samsung Galaxy A54 (Unlocked)', price: 185000, desc: 'Brand new sealed Samsung A54, 128GB. Full warranty.', photos: [PHOTOS.electronics[0], PHOTOS.electronics[1]], bargain: true, condition: 'new' },
      { name: 'iPhone 12 Pro (Used – Good)', price: 320000, desc: 'iPhone 12 Pro 256GB, space grey. Battery health 89%.', photos: [PHOTOS.electronics[2]], bargain: true, condition: 'used' },
      { name: 'Tecno Spark 20 Pro', price: 95000, desc: 'New Tecno Spark 20 Pro, 8GB RAM, 256GB storage.', photos: [PHOTOS.electronics[1], PHOTOS.electronics[3]], bargain: false, condition: 'new' },
      { name: 'JBL Bluetooth Speaker', price: 45000, desc: 'JBL Flip 6, waterproof, 12hrs battery. Sealed.', photos: [PHOTOS.electronics[1]], bargain: true, condition: 'new' },
      { name: 'Wireless Earbuds TWS Pro', price: 18000, desc: 'Hi-Fi sound, 6hr playtime, charging case.', photos: [PHOTOS.electronics[0]], bargain: true, condition: 'new' },
    ],
  },
  {
    email: 'bamendafashion@loka.cm',
    password: 'Loka@2025!',
    full_name: 'Marie-Claire Fomban',
    phone: '+237677000002',
    shop_name: 'Bamenda Fashion House',
    shop_description: 'Latest fashion for men, women, and children. New arrivals weekly. Open Monday–Saturday.',
    address_text: 'City Chemist Roundabout, Bamenda',
    avatarUrl: AVATARS.womanA,
    categorySlug: 'fashion',
    products: [
      { name: 'Nike Air Max 270 (Original)', price: 85000, desc: 'Original Nike Air Max 270. Sizes 40–45.', photos: [PHOTOS.fashion[0], PHOTOS.fashion[1]], bargain: false, condition: 'new' },
      { name: 'Ladies Ankara Dress', price: 25000, desc: 'Handmade Ankara dress. Sizes S to XL.', photos: [PHOTOS.fashion[3]], bargain: true, condition: 'new' },
      { name: "Men's Slim Fit Jeans", price: 18000, desc: 'Slim fit denim jeans, 30–40 waist. Dark blue.', photos: [PHOTOS.fashion[1]], bargain: true, condition: 'new' },
      { name: 'Traditional Kaba Dress', price: 40000, desc: 'Hand-sewn traditional kaba with matching headtie.', photos: [PHOTOS.fashion[3], PHOTOS.fashion[2]], bargain: true, condition: 'new' },
      { name: 'Leather Belt – Men', price: 8500, desc: 'Genuine leather belt, black or brown. Sizes 32–42.', photos: [PHOTOS.fashion[1]], bargain: false, condition: 'new' },
    ],
  },
  {
    email: 'mamablessing@loka.cm',
    password: 'Loka@2025!',
    full_name: 'Blessing Achu',
    phone: '+237677000003',
    shop_name: 'Mama Blessing Foods',
    shop_description: 'Local and imported groceries, drinks, and pantry staples at fair prices.',
    address_text: 'Food Market, Shed 15, Bamenda',
    avatarUrl: AVATARS.womanB,
    categorySlug: 'food',
    products: [
      { name: 'Palm Oil (5L)', price: 4500, desc: 'Locally pressed red palm oil, 5 litre container.', photos: [PHOTOS.food[0]], bargain: false, condition: 'new' },
      { name: 'Rice (25kg bag)', price: 22000, desc: 'Premium long-grain rice, 25kg bag.', photos: [PHOTOS.food[1]], bargain: true, condition: 'new' },
      { name: 'Tomato Paste (Carton, 24 tins)', price: 15000, desc: 'Carton of 24 tins, 70g each. Top brand.', photos: [PHOTOS.food[2]], bargain: true, condition: 'new' },
      { name: 'Bottled Water (Pack of 12)', price: 1800, desc: '1.5L bottled water, pack of 12.', photos: [PHOTOS.food[1]], bargain: false, condition: 'new' },
      { name: 'Maggi Cubes (Carton)', price: 9500, desc: 'Carton of seasoning cubes, 100 sachets.', photos: [PHOTOS.food[0]], bargain: false, condition: 'new' },
    ],
  },
  {
    email: 'greenmarket@loka.cm',
    password: 'Loka@2025!',
    full_name: 'Patrick Tabe',
    phone: '+237677000004',
    shop_name: 'Green Market Hub',
    shop_description: 'Fresh fruits and vegetables sourced daily from local farms around Bamenda.',
    address_text: 'Food Market, Shed 9, Bamenda',
    avatarUrl: AVATARS.manB,
    categorySlug: 'produce',
    products: [
      { name: 'Fresh Avocado (1 dozen)', price: 800, desc: 'Ripe avocados, sold per dozen.', photos: [PHOTOS.produce[0]], bargain: false, condition: 'new' },
      { name: 'Plantains (Bunch)', price: 2500, desc: 'Fresh green plantains, large bunch.', photos: [PHOTOS.produce[1]], bargain: true, condition: 'new' },
      { name: 'Tomatoes (Basket)', price: 6000, desc: 'Fresh tomatoes, full basket.', photos: [PHOTOS.produce[2]], bargain: true, condition: 'new' },
      { name: 'Irish Potatoes (50kg bag)', price: 18000, desc: 'Fresh Irish potatoes from the Northwest highlands.', photos: [PHOTOS.produce[1]], bargain: true, condition: 'new' },
      { name: 'Pineapples (each)', price: 1000, desc: 'Sweet ripe pineapples, sold individually.', photos: [PHOTOS.produce[0]], bargain: false, condition: 'new' },
    ],
  },
  {
    email: 'beautycorner@loka.cm',
    password: 'Loka@2025!',
    full_name: 'Grace Ndifor',
    phone: '+237677000005',
    shop_name: 'Beauty Corner Bamenda',
    shop_description: 'Cosmetics, skincare, and haircare products for the whole family.',
    address_text: 'Up Station, Shed 4, Bamenda',
    avatarUrl: AVATARS.womanA,
    categorySlug: 'beauty',
    products: [
      { name: 'Shea Butter (Raw, 1kg)', price: 3500, desc: 'Pure unrefined shea butter, locally sourced.', photos: [PHOTOS.beauty[0]], bargain: true, condition: 'new' },
      { name: 'Hair Extensions (Braiding Set)', price: 7500, desc: 'Synthetic braiding hair, full set, multiple colours.', photos: [PHOTOS.beauty[1]], bargain: true, condition: 'new' },
      { name: 'Body Lotion (Cocoa Butter, 500ml)', price: 4000, desc: 'Moisturising cocoa butter lotion, 500ml.', photos: [PHOTOS.beauty[2]], bargain: false, condition: 'new' },
      { name: 'Facial Cleanser Set', price: 6500, desc: '3-step facial cleansing routine set.', photos: [PHOTOS.beauty[0]], bargain: false, condition: 'new' },
      { name: 'Perfume Oil (30ml)', price: 5000, desc: 'Long-lasting perfume oil, assorted scents.', photos: [PHOTOS.beauty[2]], bargain: true, condition: 'new' },
    ],
  },
]

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-seed-secret')
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminSupabaseClient()
  const authAdmin = createSupabaseAdminAuth(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const results: Record<string, unknown>[] = []

  const { data: categories } = await admin.from('categories').select('id, name_en')

  const getCatId = (slug: string) => {
    if (!categories) return null
    const match = categories.find((c) =>
      c.name_en.toLowerCase().includes(slug) || slug.includes(c.name_en.toLowerCase().split(' ')[0]),
    )
    return match?.id ?? null
  }

  for (const v of VENDOR_PRODUCTS) {
    const { data: authUser, error: authError } = await authAdmin.auth.admin.createUser({
      email: v.email,
      password: v.password,
      email_confirm: true,
      user_metadata: { full_name: v.full_name, role: 'vendor', phone: v.phone },
    })

    let userId = authUser?.user?.id

    if (authError && !authError.message.includes('already been registered')) {
      results.push({ vendor: v.email, error: authError.message })
      continue
    }

    if (!userId) {
      const { data: existingAuth } = await authAdmin.auth.admin.listUsers()
      const found = existingAuth?.users.find((u) => u.email === v.email)
      userId = found?.id
    }

    if (!userId) {
      results.push({ vendor: v.email, error: 'Could not resolve auth user id' })
      continue
    }

    const { data: publicUser } = await admin.from('users').select('id').eq('id', userId).maybeSingle()
    if (!publicUser) {
      await admin.from('users').insert({
        id: userId,
        full_name: v.full_name,
        phone: v.phone,
        role: 'vendor',
        language_pref: 'en',
      })
    }

    const { data: existingVendor } = await admin.from('vendors').select('id').eq('user_id', userId).maybeSingle()

    let vendorId: string
    const catId = getCatId(v.categorySlug)

    if (existingVendor) {
      vendorId = existingVendor.id
      await admin.from('vendors').update({
        verification_status: 'approved',
        verified_at: new Date().toISOString(),
        is_active: true,
        shop_name: v.shop_name,
        shop_description: v.shop_description,
        shop_avatar_url: v.avatarUrl,
        address_text: v.address_text,
        category_id: catId,
      }).eq('id', vendorId)
    } else {
      const { data: newVendor, error: vendorError } = await admin.from('vendors').insert({
        user_id: userId,
        shop_name: v.shop_name,
        shop_description: v.shop_description,
        shop_avatar_url: v.avatarUrl,
        address_text: v.address_text,
        latitude: 5.9597 + Math.random() * 0.01,
        longitude: 10.1455 + Math.random() * 0.01,
        category_id: catId,
        verification_status: 'approved',
        verified_at: new Date().toISOString(),
        is_active: true,
        operating_hours: { opens: '08:00', closes: '18:00' },
        years_trading: '3–5 years',
      }).select('id').single()

      if (vendorError || !newVendor) {
        results.push({ vendor: v.email, error: vendorError?.message ?? 'Failed to create vendor' })
        continue
      }
      vendorId = newVendor.id
    }

    let productCount = 0
    for (const p of v.products) {
      const { error: productError } = await admin.from('products').insert({
        vendor_id: vendorId,
        name_en: p.name,
        description_en: p.desc,
        price: p.price,
        condition: p.condition,
        stock_status: 'in_stock',
        bargaining_allowed: p.bargain,
        photo_urls: p.photos,
        category_id: catId,
        is_published: true,
        view_count: Math.floor(Math.random() * 80),
      })
      if (!productError) productCount++
      else results.push({ vendor: v.shop_name, product: p.name, error: productError.message })
    }

    results.push({ vendor: v.shop_name, userId, vendorId, products: productCount, status: 'ok' })
  }

  return NextResponse.json({ results })
}