import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUploadSignature, UploadFolder } from '@/lib/utils/cloudinary'

const ALLOWED_FOLDERS: UploadFolder[] = [
  'Loka/products',
  'Loka/identity_docs',
  'Loka/shop_avatars',
]

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const folder       = req.nextUrl.searchParams.get('folder') as UploadFolder
  const resourceType = (req.nextUrl.searchParams.get('resourceType') ?? 'image') as 'image' | 'auto'

  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
  }

  try {
    return NextResponse.json(getUploadSignature(folder, resourceType))
  } catch {
    return NextResponse.json(
      { error: 'Image uploads unavailable — Cloudinary not configured' },
      { status: 503 },
    )
  }
}