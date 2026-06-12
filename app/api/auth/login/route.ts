import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { adminSupabase } from '@/lib/supabase/admin'
import { loginSchema } from '@/lib/validations/auth'
import { checkRateLimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
    const { success } = await checkRateLimit(`login:${ip}`)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a moment.' },
        { status: 429 }
      )
    }

    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 })
    }

    const { email, password } = result.data

    // Collect cookies Supabase wants to set — applied to response below
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session || !data.user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await adminSupabase
      .from('users')
      .select('id, full_name, phone, role, language_pref, avatar_url')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Account profile not found.' }, { status: 404 })
    }

    const res = NextResponse.json({
      token: data.session.access_token,
      user: {
        id: profile.id,
        full_name: profile.full_name ?? '',
        email: data.user.email ?? '',
        phone: profile.phone,
        role: profile.role,
        language_pref: profile.language_pref,
        avatar_url: profile.avatar_url,
      },
    })

    // Apply Supabase session cookies directly to the response object
    pendingCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2])
    })

    // Session presence indicator for proxy.ts edge check
res.cookies.set('loka-session', '1', {
        httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return res
  } catch (e) {
    console.error('[login]', e)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}