import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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

    await supabase.auth.signOut()

    const res = NextResponse.json({ message: 'Logged out.' })

    // Apply Supabase cookie deletions
    pendingCookies.forEach(({ name, value, options }) => {
      res.cookies.set(name, value, options as Parameters<typeof res.cookies.set>[2])
    })

    // Clear our indicator — both maxAge AND expires required for all browsers
    res.cookies.set('Loka-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    })

    // Clear any remaining sb- cookies from the request
    req.cookies.getAll()
      .filter((c) => c.name.startsWith('sb-'))
      .forEach((c) => {
        res.cookies.set(c.name, '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 0,
          expires: new Date(0),
        })
      })

    return res
  } catch (e) {
    console.error('[logout]', e)
    return NextResponse.json({ error: 'Logout failed.' }, { status: 500 })
  }
}