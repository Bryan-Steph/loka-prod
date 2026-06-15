import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function assertParticipant(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  conversationId: string,
  userId: string,
): Promise<{ role: 'buyer' | 'vendor'; vendorId: string | null } | null> {
  const { data: conversation } = await admin
    .from('conversations')
    .select('id, buyer_id, vendor_id, vendors(user_id)')
    .eq('id', conversationId)
    .single()

  if (!conversation) return null

  if (conversation.buyer_id === userId) {
    return { role: 'buyer', vendorId: conversation.vendor_id }
  }

  const vendorRecord = conversation.vendors as unknown as { user_id: string } | null
  if (vendorRecord?.user_id === userId) {
    return { role: 'vendor', vendorId: conversation.vendor_id }
  }

  return null
}