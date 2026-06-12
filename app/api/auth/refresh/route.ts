import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'No valid session.' }, { status: 401 })
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'No valid session.' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await adminSupabase
      .from('users')
      .select('id, full_name, phone, role, language_pref, avatar_url')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
    }

    const res = NextResponse.json({
      token: session.access_token,
      user: {
        id:            profile.id,
        full_name:     profile.full_name ?? '',
        email:         user.email       ?? '',
        phone:         profile.phone,
        role:          profile.role,
        language_pref: profile.language_pref,
        avatar_url:    profile.avatar_url,
      },
    })

    // Renew the indicator — keeps proxy happy even as Supabase tokens rotate
    res.cookies.set('loka-session', '1', {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    })

    return res
  } catch (e) {
    console.error('[refresh]', e)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}