import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export const revalidate = 3600

export async function GET() {
  const admin = createAdminSupabaseClient()
  const { data: categories, error } = await admin
    .from('categories')
    .select('id, name_en, name_fr, icon_emoji, sort_order')
    .is('parent_id', null)          // top-level categories only for the UI chips
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categories: categories ?? [] })
}