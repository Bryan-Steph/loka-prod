import { v2 as cloudinary } from 'cloudinary'

const isConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export type UploadFolder =
  | 'loka/products'
  | 'loka/identity_docs'
  | 'loka/shop_avatars'
  | 'loka/vendor_videos'    // ← NEW: video verification
  | 'loka/avatars'          // ← NEW: buyer/vendor profile photos

export function getUploadSignature(
  folder: UploadFolder,
  resourceType: 'image' | 'auto' | 'video' = 'image',
) {
  if (!isConfigured) throw new Error('Cloudinary credentials not configured')

  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign: Record<string, string | number> = { folder, timestamp }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!,
  )

  return {
    timestamp,
    signature,
    cloudName:    process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey:       process.env.CLOUDINARY_API_KEY!,
    folder,
    resourceType,
  }
}

export { cloudinary }