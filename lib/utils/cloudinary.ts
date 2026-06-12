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
  | 'Loka/products'
  | 'Loka/identity_docs'
  | 'Loka/shop_avatars'

export function getUploadSignature(
  folder: UploadFolder,
  resourceType: 'image' | 'auto' = 'image',
) {
  if (!isConfigured) throw new Error('Cloudinary credentials not configured')

  const timestamp = Math.round(Date.now() / 1000)

  // ONLY sign params that will go in the POST body — resource_type goes in the
  // URL path (/v1_1/{cloud_name}/{resource_type}/upload), NOT the body.
  // Including it here creates a signature mismatch → 401.
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
    resourceType, // still returned so the client knows which URL path to use
  }
}

export { cloudinary }