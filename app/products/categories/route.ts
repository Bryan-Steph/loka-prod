import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { data: categories, error } = await adminSupabase
      .from('categories')
      .select('id, name_en, name_fr, icon_emoji, sort_order')
      .is('parent_id', null)           // top-level categories only
      .order('sort_order', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ categories: categories ?? [] })
  } catch (e) {
    console.error('[categories GET]', e)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}