// Fapshi Live payment API client — with built-in simulation mode.
// Set PAYMENT_SIMULATION_MODE=true to bypass the real Fapshi network calls.
// All escrow logic (DB, pickup codes, notifications, SMS) stays fully real —
// only the external MoMo network call is mocked. Flip this flag to false
// once verified Fapshi credentials are available; no other code changes needed.

const BASE = 'https://live.fapshi.com'

export const PAYMENT_SIMULATION_MODE = process.env.PAYMENT_SIMULATION_MODE === 'true'

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
  data: { transId: string; link: string }
}

export async function initiatePayment({
  amount, phone, externalId, message, redirectUrl,
}: {
  amount: number; phone: string; externalId: string; message: string; redirectUrl: string
}): Promise<FapshiPaymentResult> {
  if (PAYMENT_SIMULATION_MODE) {
    console.log(`[SIMULATION] initiatePayment: ${amount} XAF to ${phone} (ref ${externalId})`)
    return {
      statusCode: 200,
      message: 'Simulated payment initiated',
      data: { transId: `SIM-${externalId.slice(0, 8)}`, link: '' },
    }
  }

  const res = await fetch(`${BASE}/initiate-pay`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ amount, phone, userId: externalId, externalId, redirectUrl, message }),
  })
  const data = await res.json()
  if (!res.ok || (data.statusCode && data.statusCode >= 400)) {
    throw new Error(`Fapshi initiate-pay failed [${res.status}]: ${data.message ?? JSON.stringify(data)}`)
  }
  return data as FapshiPaymentResult
}

export async function disburseToVendor({
  amount, phone, name, externalId,
}: {
  amount: number; phone: string; name: string; externalId: string
}) {
  if (PAYMENT_SIMULATION_MODE) {
    console.log(`[SIMULATION] disburseToVendor: ${amount} XAF to ${phone} (${name}, ref ${externalId})`)
    return { statusCode: 200, message: 'Simulated disbursement', data: { transId: `SIM-${externalId}` } }
  }

  const res = await fetch(`${BASE}/payout`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ amount, phone, name, externalId, medium: 'mobile money' }),
  })
  const data = await res.json()
  if (!res.ok || (data.statusCode && data.statusCode >= 400)) {
    throw new Error(`Fapshi payout failed [${res.status}]: ${data.message ?? JSON.stringify(data)}`)
  }
  return data
}

export function verifyWebhookToken(token: string | null): boolean {
  if (!token) return false
  return token === process.env.FAPSHI_WEBHOOK_SECRET
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('237') && digits.length === 12) return digits
  if (digits.startsWith('6')   && digits.length ===  9) return `237${digits}`
  if (digits.startsWith('237') && digits.length !== 12) return digits
  return digits
}