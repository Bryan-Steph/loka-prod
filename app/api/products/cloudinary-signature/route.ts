import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUploadSignature, UploadFolder } from '@/lib/utils/cloudinary'

const ALLOWED_FOLDERS: UploadFolder[] = [
  'loka/products',
  'loka/identity_docs',
  'loka/shop_avatars',
  'loka/vendor_videos',
  'loka/avatars',
]

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const folder       = req.nextUrl.searchParams.get('folder') as UploadFolder
  const resourceType = (req.nextUrl.searchParams.get('resourceType') ?? 'image') as 'image' | 'auto' | 'video'

  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 })
  }

  try {
    return NextResponse.json(getUploadSignature(folder, resourceType))
  } catch {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 503 })
  }
}