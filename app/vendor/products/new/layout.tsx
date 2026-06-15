import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { VerificationGate } from '@/components/vendor/VerificationGate'

export default async function NewProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminSupabaseClient()
  const { data: vendor } = await admin
    .from('vendors')
    .select('verification_status')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/shop')

  if (vendor.verification_status !== 'approved') {
    return <VerificationGate status={vendor.verification_status} />
  }

  return <>{children}</>
}