import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { product_id } = await req.json()
  if (!product_id) return NextResponse.json({ error: 'product_id is required' }, { status: 400 })

  const admin = createAdminSupabaseClient()

  const { data: product, error: productError } = await admin
    .from('products')
    .select('id, vendor_id, name_en')
    .eq('id', product_id)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  // A vendor cannot bargain on their own product
  const { data: ownVendor } = await admin
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (ownVendor && ownVendor.id === product.vendor_id) {
    return NextResponse.json({ error: 'You cannot bargain on your own product' }, { status: 400 })
  }

  const { data: existing } = await admin
    .from('conversations')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('vendor_id', product.vendor_id)
    .eq('product_id', product_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ conversation_id: existing.id })
  }

  const { data: conversation, error } = await admin
    .from('conversations')
    .insert({
      buyer_id: user.id,
      vendor_id: product.vendor_id,
      product_id,
      last_message_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !conversation) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create conversation' }, { status: 500 })
  }

  await admin.from('messages').insert({
    conversation_id: conversation.id,
    sender_id: user.id,
    content: `Started a bargain on "${product.name_en}"`,
    message_type: 'system',
    is_read: false,
  })

  return NextResponse.json({ conversation_id: conversation.id }, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  const { data: profile } = await admin.from('users').select('role').eq('id', user.id).single()
  const role = profile?.role === 'vendor' ? 'vendor' : 'buyer'

  let query = admin
    .from('conversations')
    .select('id, buyer_id, vendor_id, product_id, last_message_at, is_archived, products(id, name_en, price, photo_urls), vendors(id, shop_name, shop_avatar_url, verification_status)')
    .order('last_message_at', { ascending: false })

  if (role === 'vendor') {
    const { data: vendor } = await admin.from('vendors').select('id').eq('user_id', user.id).single()
    if (!vendor) return NextResponse.json({ conversations: [], role })
    query = query.eq('vendor_id', vendor.id)
  } else {
    query = query.eq('buyer_id', user.id)
  }

  const { data: conversations, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids = (conversations ?? []).map((c) => c.id)
  const unreadMap: Record<string, number> = {}
  const lastMessageMap: Record<string, { content: string; created_at: string } | null> = {}
  const buyerProfiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {}

  if (ids.length > 0) {
    const [unreadRes, lastMsgRes] = await Promise.all([
      admin.from('messages').select('conversation_id').in('conversation_id', ids).eq('is_read', false).neq('sender_id', user.id),
      admin.from('messages').select('conversation_id, content, created_at, message_type').in('conversation_id', ids).order('created_at', { ascending: false }),
    ])

    for (const row of unreadRes.data ?? []) {
      unreadMap[row.conversation_id] = (unreadMap[row.conversation_id] ?? 0) + 1
    }
    for (const row of lastMsgRes.data ?? []) {
      if (!lastMessageMap[row.conversation_id]) {
        lastMessageMap[row.conversation_id] = {
          content: row.message_type === 'offer' ? '💰 Offer sent' : row.content,
          created_at: row.created_at,
        }
      }
    }

    if (role === 'vendor') {
      const buyerIds = [...new Set((conversations ?? []).map((c) => c.buyer_id))]
      const { data: buyers } = await admin.from('users').select('id, full_name, avatar_url').in('id', buyerIds)
      for (const b of buyers ?? []) {
        buyerProfiles[b.id] = { full_name: b.full_name, avatar_url: b.avatar_url }
      }
    }
  }

  const result = (conversations ?? []).map((c) => ({
    ...c,
    buyer: buyerProfiles[c.buyer_id] ?? null,
    unread_count: unreadMap[c.id] ?? 0,
    last_message: lastMessageMap[c.id] ?? null,
  }))

  return NextResponse.json({ conversations: result, role })
}