import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin } from '@/lib/admin/assertAdmin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const ctx = await assertAdmin()
  if (!ctx) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { admin } = ctx
  const role  = req.nextUrl.searchParams.get('role') ?? 'all'
  const page  = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10))
  const limit = 50
  const offset = (page - 1) * limit

  let query = admin
    .from('users')
    .select('id, full_name, phone, role, avatar_url, language_pref', { count: 'exact' })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1)

  if (role !== 'all') {
    query = query.eq('role', role)
  }

  const { data: users, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ users: users ?? [], total: count ?? 0, page, limit })
}