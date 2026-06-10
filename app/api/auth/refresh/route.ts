import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { adminSupabase } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const pendingCookies: Array<{
      name: string; value: string; options: Record<string, unknown>
    }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              pendingCookies.push({ name, value, options: options as Record<string, unknown> })
            )
          },
        },
      }
    )

    // Verifies JWT with Supabase Auth server — auto-refreshes if expired
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
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
        id: profile.id,
        full_name: profile.full_name ?? '',
        email: user.email ?? '',
        phone: profile.phone,
        role: profile.role,
        language_pref: profile.language_pref,
        avatar_url: profile.avatar_url,
      },
    })

    // Apply any refreshed token cookies to the response
    pendingCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2])
    })

    return res
  } catch (e) {
    console.error('[refresh]', e)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}