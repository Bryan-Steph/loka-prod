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
  if (!user) return NextResponse.json({ saved: false })

  const admin = createAdminSupabaseClient()
  const { data } = await admin
    .from('saved_products')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('product_id', id)
    .maybeSingle()

  return NextResponse.json({ saved: !!data })
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabaseClient()

  const { data: existing } = await admin
    .from('saved_products')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('product_id', id)
    .maybeSingle()

  if (existing) {
    await admin.from('saved_products')
      .delete()
      .eq('buyer_id', user.id)
      .eq('product_id', id)
    return NextResponse.json({ saved: false })
  }

  await admin.from('saved_products').insert({ buyer_id: user.id, product_id: id })
  return NextResponse.json({ saved: true })
}