import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { assertParticipant } from '../../_lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json()
  const trimmed = String(content ?? '').trim()
  if (!trimmed) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
  if (trimmed.length > 1000) return NextResponse.json({ error: 'Message too long' }, { status: 400 })

  const admin = createAdminSupabaseClient()
  const participant = await assertParticipant(admin, id, user.id)
  if (!participant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: message, error } = await admin
    .from('messages')
    .insert({ conversation_id: id, sender_id: user.id, content: trimmed, message_type: 'text', is_read: false })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', id)

  return NextResponse.json({ message }, { status: 201 })
}