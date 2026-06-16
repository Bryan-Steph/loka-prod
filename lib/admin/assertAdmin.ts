import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

/**
 * Shared admin guard for API routes.
 * Returns null if caller is not authenticated or not an admin.
 */
export async function assertAdmin() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null

    const admin = createAdminSupabaseClient()
    const { data: profile } = await admin
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') return null

    return { userId: user.id, admin, profile }
  } catch {
    return null
  }
}