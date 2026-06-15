import { NextRequest, NextResponse } from 'next/server'
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

const PHONE_REGEX = /^\+2376[5-9]\d{7}$/
const PATCHABLE = ['full_name', 'phone', 'language_pref', 'avatar_url'] as const

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const updates: Record<string, unknown> = {}

    for (const key of PATCHABLE) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    if ('full_name' in updates) {
      const name = String(updates.full_name ?? '').trim()
      if (name.length < 2) {
        return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
      }
      updates.full_name = name
    }

    if ('phone' in updates) {
      const phone = String(updates.phone ?? '').trim()
      if (!PHONE_REGEX.test(phone)) {
        return NextResponse.json({ error: 'Phone must be +237 followed by a valid number' }, { status: 400 })
      }
      updates.phone = phone
    }

    if ('language_pref' in updates && !['en', 'fr'].includes(String(updates.language_pref))) {
      return NextResponse.json({ error: 'language_pref must be en or fr' }, { status: 400 })
    }

    const admin = createAdminSupabaseClient()
    const { data: profile, error: updateError } = await admin
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select('id, full_name, phone, role, language_pref, avatar_url, created_at')
      .single()

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    return NextResponse.json({ profile: { ...profile, email: user.email ?? '' } })
  } catch (e) {
    console.error('[users/me PATCH]', e)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}