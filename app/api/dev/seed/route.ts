import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { createClient as createSupabaseAdminAuth } from '@supabase/supabase-js'

// Unsplash photo IDs (stable, no API key needed)
const PHOTOS = {
  electronics: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80',
    'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=600&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
  ],
  fashion: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80',
    'https://images.unsplash.com/photo-1525562723836-dca67a71d5f1?w=600&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    'https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=600&q=80',
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
  ],
}

const VENDOR_PRODUCTS: {
  email: string
  password: string
  full_name: string
  phone: string
  shop_name: string
  shop_description: string
  address_text: string
  categorySlug: string
  products: { name: string; price: number; desc: string; photos: string[]; bargain: boolean }[]
}[] = [
  {
    email: 'techhub@loka.cm',
    password: 'Loka@2025!',
    full_name: 'Jean-Paul Nguemo',
    phone: '+237677000001',
    shop_name: 'TechHub Bamenda',
    shop_description: 'Quality phones, laptops, and accessories at the best prices in Bamenda. All products tested before sale.',
    address_text: 'Commercial Avenue, Shed 7, Bamenda',
    categorySlug: 'electronics',
    products: [
      { name: 'Samsung Galaxy A54 (Unlocked)', price: 185000, desc: 'Brand new sealed Samsung A54 with 128GB storage. Full warranty.', photos: [PHOTOS.electronics[0], PHOTOS.electronics[1], PHOTOS.electronics[2]], bargain: true },
      { name: 'iPhone 12 Pro (Used – Good)', price: 320000, desc: 'iPhone 12 Pro 256GB, space grey. Minor scratches. Battery health 89%.', photos: [PHOTOS.electronics[2], PHOTOS.electronics[0]], bargain: true },
      { name: 'Tecno Spark 20 Pro', price: 95000, desc: 'New Tecno Spark 20 Pro, 8GB RAM, 256GB storage. Cameroon warranty.', photos: [PHOTOS.electronics[1], PHOTOS.electronics[3]], bargain: false },
      { name: 'Infinix Hot 40i', price: 75000, desc: 'Budget smartphone, great camera, 5000mAh battery. New in box.', photos: [PHOTOS.electronics[0], PHOTOS.electronics[2]], bargain: true },
      { name: 'Dell Latitude Laptop (Refurbished)', price: 280000, desc: 'Dell i5 8th gen, 8GB RAM, 256GB SSD. Clean, tested, 3 months warranty.', photos: [PHOTOS.electronics[4], PHOTOS.electronics[3]], bargain: true },
      { name: 'MacBook Air M1 (Used)', price: 550000, desc: 'MacBook Air M1 8GB 256GB. Silver. Excellent condition, original charger.', photos: [PHOTOS.electronics[4], PHOTOS.electronics[3], PHOTOS.electronics[0]], bargain: false },
      { name: 'JBL Bluetooth Speaker', price: 45000, desc: 'JBL Flip 6, waterproof, 12hrs battery. New sealed.', photos: [PHOTOS.electronics[1], PHOTOS.electronics[2]], bargain: true },
      { name: 'USB-C Fast Charger 65W', price: 12000, desc: '65W GaN charger, compatible with all USB-C devices. New.', photos: [PHOTOS.electronics[0]], bargain: false },
      { name: 'Samsung Galaxy Tab A8', price: 145000, desc: 'Galaxy Tab A8 32GB WiFi. New. Perfect for students and video.', photos: [PHOTOS.electronics[2], PHOTOS.electronics[1]], bargain: true },
      { name: 'Wireless Earbuds TWS Pro', price: 18000, desc: 'Hi-Fi sound, 6hr playtime, charging case. Compatible iPhone & Android.', photos: [PHOTOS.electronics[0], PHOTOS.electronics[1]], bargain: true },
      { name: 'Power Bank 20,000mAh', price: 22000, desc: 'Dual USB + USB-C. Fast charge. Enough for 4 full phone charges.', photos: [PHOTOS.electronics[1]], bargain: false },
      { name: 'Smart TV Android 43" (Used)', price: 195000, desc: 'Samsung 43" 4K smart TV, Android, Netflix ready. Good condition.', photos: [PHOTOS.electronics[4], PHOTOS.electronics[3]], bargain: true },
      { name: 'Itel P40 (New)', price: 55000, desc: 'Itel P40, 4GB RAM, 64GB. Budget pick, great battery life. Sealed box.', photos: [PHOTOS.electronics[0]], bargain: true },
      { name: 'Phone Protective Case – Universal', price: 3500, desc: 'Heavy duty case fits most Android phones. Black. Very durable.', photos: [PHOTOS.electronics[1]], bargain: true },
      { name: 'Screen Protector (Tempered Glass)', price: 2500, desc: 'Universal tempered glass protector. Fits phones 6.0–6.7 inch.', photos: [PHOTOS.electronics[2]], bargain: false },
    ],
  },
  {
    email: 'bamendafashion@loka.cm',
    password: 'Loka@2025!',
    full_name: 'Marie-Claire Fomban',
    phone: '+237677000002',
    shop_name: 'Bamenda Fashion House',
    shop_description: 'Latest fashion for men, women, and children. New arrivals weekly. Open Monday–Saturday 8am–7pm.',
    address_text: 'City Chemist Roundabout, Bamenda',
    categorySlug: 'fashion',
    products: [
      { name: 'Nike Air Max 270 (Original)', price: 85000, desc: 'Original Nike Air Max 270. Size 40–45 available. New.', photos: [PHOTOS.fashion[0], PHOTOS.fashion[1], PHOTOS.fashion[2]], bargain: false },
      { name: 'Ladies Ankara Dress', price: 25000, desc: 'Beautiful handmade Ankara dress. Sizes S to XL. Multiple patterns.', photos: [PHOTOS.fashion[3], PHOTOS.fashion[4]], bargain: true },
      { name: 'Men\'s Slim Fit Jeans', price: 18000, desc: 'Slim fit denim jeans, 30–40 waist. Dark blue. Great quality.', photos: [PHOTOS.fashion[1], PHOTOS.fashion[2]], bargain: true },
      { name: 'Adidas Running Shoes', price: 65000, desc: 'Adidas Ultraboost 22. Sizes 39–46. New with box.', photos: [PHOTOS.fashion[0], PHOTOS.fashion[1]], bargain: true },
      { name: 'Women\'s Office Blazer', price: 35000, desc: 'Professional blazer, navy blue. Sizes 36–46. Perfect for interviews.', photos: [PHOTOS.fashion[4], PHOTOS.fashion[3]], bargain: false },
      { name: 'Traditional Kaba Dress', price: 40000, desc: 'Hand-sewn traditional kaba with matching headtie. All sizes.', photos: [PHOTOS.fashion[3], PHOTOS.fashion[4], PHOTOS.fashion[2]], bargain: true },
      { name: 'Men\'s Agbada Set (White)', price: 55000, desc: 'Traditional agbada 3-piece set in white damask. Custom sizing available.', photos: [PHOTOS.fashion[4], PHOTOS.fashion[3]], bargain: true },
      { name: 'Leather Belt – Men', price: 8500, desc: 'Genuine leather belt, black or brown. Sizes 32–42. Great finish.', photos: [PHOTOS.fashion[1]], bargain: false },
      { name: 'Children School Uniform Set', price: 12000, desc: 'Complete school uniform (shirt + trousers/skirt). Ages 5–15. Navy blue.', photos: [PHOTOS.fashion[2], PHOTOS.fashion[3]], bargain: false },
      { name: 'Ladies Heels (Block Heel)', price: 22000, desc: 'Block heel pumps. Available in black, nude, red. Sizes 37–42.', photos: [PHOTOS.fashion[0], PHOTOS.fashion[1]], bargain: true },
      { name: 'Sports Jersey – Generic', price: 9500, desc: 'Breathable polyester jersey. Various colours. Great for gym or sport.', photos: [PHOTOS.fashion[2]], bargain: true },
      { name: 'Men\'s Formal Shirt (Oxford)', price: 14000, desc: 'Oxford weave formal shirt, white/blue/grey. S to XXL. New.', photos: [PHOTOS.fashion[4], PHOTOS.fashion[3]], bargain: false },
      { name: 'Handbag – Ladies Tote', price: 28000, desc: 'Large PU leather tote, zipper closure. Black, brown, tan options.', photos: [PHOTOS.fashion[3], PHOTOS.fashion[2]], bargain: true },
      { name: 'Sneakers – Unisex Canvas', price: 15000, desc: 'Classic canvas sneakers. Sizes 36–46. White and black only.', photos: [PHOTOS.fashion[0], PHOTOS.fashion[1], PHOTOS.fashion[2]], bargain: true },
      { name: 'Kids Sandals (School)', price: 7500, desc: 'Durable PU sandals for school kids. Black. Sizes 28–38.', photos: [PHOTOS.fashion[1]], bargain: false },
    ],
  },
]

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-seed-secret')
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminSupabaseClient()

  // Auth admin client (same creds but directly)
  const authAdmin = createSupabaseAdminAuth(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const results: Record<string, unknown>[] = []

  // Get category IDs
  const { data: categories } = await admin
    .from('categories')
    .select('id, name_en, icon_emoji')

  const getCatId = (slug: string) => {
    if (!categories) return null
    const match = categories.find((c) =>
      c.name_en.toLowerCase().includes(slug) ||
      slug.includes(c.name_en.toLowerCase().split(' ')[0])
    )
    return match?.id ?? null
  }

  for (const vendorData of VENDOR_PRODUCTS) {
    // 1. Create auth user
    const { data: authUser, error: authError } = await authAdmin.auth.admin.createUser({
      email:    vendorData.email,
      password: vendorData.password,
      email_confirm: true,
      user_metadata: {
        full_name: vendorData.full_name,
        role:      'vendor',
        phone:     vendorData.phone,
      },
    })

    if (authError && !authError.message.includes('already been registered')) {
      results.push({ vendor: vendorData.email, error: authError.message })
      continue
    }

    const userId = authUser?.user?.id

    if (!userId) {
      // User exists — get their ID
      const { data: existing } = await admin
        .from('users')
        .select('id')
        .eq('phone', vendorData.phone)
        .single()
      if (!existing) { results.push({ vendor: vendorData.email, error: 'Cannot find existing user' }); continue }
    }

    // 2. Ensure public.users row exists
    const { data: publicUser } = await admin
      .from('users')
      .select('id')
      .eq('id', userId ?? '')
      .maybeSingle()

    if (!publicUser && userId) {
      await admin.from('users').insert({
        id:            userId,
        full_name:     vendorData.full_name,
        phone:         vendorData.phone,
        role:          'vendor',
        language_pref: 'en',
      })
    }

    const finalUserId = publicUser?.id ?? userId
    if (!finalUserId) continue

    // 3. Ensure vendor profile exists and is approved
    const { data: existingVendor } = await admin
      .from('vendors')
      .select('id')
      .eq('user_id', finalUserId)
      .maybeSingle()

    let vendorId: string

    if (existingVendor) {
      vendorId = existingVendor.id
      await admin
        .from('vendors')
        .update({
          verification_status: 'approved',
          verified_at:         new Date().toISOString(),
          is_active:           true,
          shop_name:           vendorData.shop_name,
          shop_description:    vendorData.shop_description,
          address_text:        vendorData.address_text,
          category_id:         getCatId(vendorData.categorySlug),
        })
        .eq('id', vendorId)
    } else {
      const { data: newVendor, error: vendorError } = await admin
        .from('vendors')
        .insert({
          user_id:             finalUserId,
          shop_name:           vendorData.shop_name,
          shop_description:    vendorData.shop_description,
          address_text:        vendorData.address_text,
          latitude:            5.9597 + Math.random() * 0.01,
          longitude:           10.1455 + Math.random() * 0.01,
          category_id:         getCatId(vendorData.categorySlug),
          verification_status: 'approved',
          verified_at:         new Date().toISOString(),
          is_active:           true,
          operating_hours:     { opens: '08:00', closes: '18:00' },
          years_trading:       '3–5 years',
        })
        .select('id')
        .single()

      if (vendorError || !newVendor) {
        results.push({ vendor: vendorData.email, error: vendorError?.message ?? 'Failed to create vendor' })
        continue
      }
      vendorId = newVendor.id
    }

    // 4. Insert products
    const catId = getCatId(vendorData.categorySlug)
    let productCount = 0

    for (const p of vendorData.products) {
      const { error: productError } = await admin.from('products').insert({
        vendor_id:         vendorId,
        name_en:           p.name,
        description_en:    p.desc,
        price:             p.price,
        condition:         'new',
        stock_status:      'in_stock',
        bargaining_allowed: p.bargain,
        photo_urls:        p.photos,
        category_id:       catId,
        is_published:      true,
        view_count:        Math.floor(Math.random() * 120),
      })
      if (!productError) productCount++
    }

    results.push({
      vendor:   vendorData.shop_name,
      userId:   finalUserId,
      vendorId,
      products: productCount,
      status:   'ok',
    })
  }

  return NextResponse.json({ results })
}