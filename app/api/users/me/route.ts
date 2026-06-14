import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile, error: profileError } = await createAdminSupabaseClient()
      .from('users')
      .select('id, full_name, phone, role, language_pref, avatar_url, created_at')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      profile: { ...profile, email: user.email ?? '' },
    })
  } catch (e) {
    console.error('[users/me GET]', e)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}