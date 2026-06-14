import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

// Prevents Turbopack from prefetching this layout during build —
// it requires request-time cookies and causes a timing crash otherwise.
export const dynamic = 'force-dynamic'

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const admin = createAdminSupabaseClient()
  const { data: profile } = await admin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Vendor clicking the chat icon gets sent to their own area, not a blank error
  if (profile.role === 'vendor') redirect('/vendor/dashboard')

  if (profile.role !== 'buyer') redirect('/login')

  return <>{children}</>
}