// Fapshi Live payment API client
// Base: https://live.fapshi.com
// Docs: https://docs.fapshi.com
//
// ⚠️  FAPSHI_API_USER must be your account email (not the webhook URL)

const BASE = 'https://live.fapshi.com'

function headers() {
  return {
    'Content-Type': 'application/json',
    'apiuser':      process.env.FAPSHI_API_USER!,
    'apikey':       process.env.FAPSHI_API_KEY!,
  }
}

export interface FapshiPaymentResult {
  statusCode: number
  message:    string
  data: {
    transId: string
    link:    string
  }
}

/**
 * Initiate an MTN MoMo payment.
 * Providing `phone` sends a USSD push directly to the buyer's handset.
 * The response also contains a `link` the buyer can open as fallback.
 *
 * @param externalId  Our transaction UUID — Fapshi echoes this in the webhook
 */
export async function initiatePayment({
  amount,
  phone,
  externalId,
  message,
  redirectUrl,
}: {
  amount:      number
  phone:       string   // 237XXXXXXXXX — no + sign
  externalId:  string
  message:     string
  redirectUrl: string
}): Promise<FapshiPaymentResult> {
  const res = await fetch(`${BASE}/initiate-pay`, {
    method:  'POST',
    headers: headers(),
    body: JSON.stringify({
      amount,
      phone,
      userId:      externalId,   // echoed back in webhook
      externalId,
      redirectUrl,
      message,
    }),
  })

  const data = await res.json()

  if (!res.ok || (data.statusCode && data.statusCode >= 400)) {
    throw new Error(
      `Fapshi initiate-pay failed [${res.status}]: ${data.message ?? JSON.stringify(data)}`
    )
  }

  return data as FapshiPaymentResult
}

/**
 * Disburse funds to a vendor's MTN MoMo account.
 * Called after the buyer's pickup code is confirmed.
 */
export async function disburseToVendor({
  amount,
  phone,
  name,
  externalId,
}: {
  amount:     number
  phone:      string    // 237XXXXXXXXX
  name:       string
  externalId: string    // unique disbursement reference
}) {
  const res = await fetch(`${BASE}/payout`, {
    method:  'POST',
    headers: headers(),
    body: JSON.stringify({
      amount,
      phone,
      name,
      externalId,
      medium: 'mobile money',
    }),
  })

  const data = await res.json()

  if (!res.ok || (data.statusCode && data.statusCode >= 400)) {
    throw new Error(
      `Fapshi payout failed [${res.status}]: ${data.message ?? JSON.stringify(data)}`
    )
  }

  return data
}

/**
 * Fapshi webhook verification.
 * Fapshi sends the webhook secret directly in the x-webhook-token header.
 * This is a direct equality check — no HMAC involved.
 */
export function verifyWebhookToken(token: string | null): boolean {
  if (!token) return false
  return token === process.env.FAPSHI_WEBHOOK_SECRET
}

/**
 * Normalize a Cameroon phone number to Fapshi format: 237XXXXXXXXX
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('237') && digits.length === 12) return digits
  if (digits.startsWith('6')   && digits.length ===  9) return `237${digits}`
  if (digits.startsWith('237') && digits.length !== 12) return digits
  return digits
}