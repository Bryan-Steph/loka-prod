import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  const { data: conversation, error } = await admin
    .from('conversations')
    .select('id, buyer_id, vendor_id, product_id, last_message_at, products(id, name_en, price, photo_urls, bargaining_allowed), vendors(id, shop_name, shop_avatar_url, user_id, verification_status)')
    .eq('id', id)
    .single()

  if (error || !conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  const vendorRecord = conversation.vendors as unknown as {
    id: string; shop_name: string; shop_avatar_url: string | null; user_id: string; verification_status: string
  } | null

  const isBuyer  = conversation.buyer_id === user.id
  const isVendor = vendorRecord?.user_id === user.id

  if (!isBuyer && !isVendor) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await admin
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', id)
    .neq('sender_id', user.id)
    .eq('is_read', false)

  const [messagesRes, offersRes, buyerRes] = await Promise.all([
    admin.from('messages').select('*').eq('conversation_id', id).order('created_at', { ascending: true }),
    admin.from('bargain_offers').select('*').eq('conversation_id', id).order('created_at', { ascending: true }),
    admin.from('users').select('id, full_name, avatar_url').eq('id', conversation.buyer_id).single(),
  ])

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      product: conversation.products,
      vendor: vendorRecord ? {
        id: vendorRecord.id,
        shop_name: vendorRecord.shop_name,
        shop_avatar_url: vendorRecord.shop_avatar_url,
        verification_status: vendorRecord.verification_status,
      } : null,
      buyer: buyerRes.data ?? null,
    },
    messages: messagesRes.data ?? [],
    offers: offersRes.data ?? [],
    role: isVendor ? 'vendor' : 'buyer',
    currentUserId: user.id,
  })
}