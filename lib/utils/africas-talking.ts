// Africa's Talking SMS client
// Currently on SANDBOX mode (username: sandbox)
// Switch AFRICAS_TALKING_USERNAME to your real username for production SMS delivery

const isProduction = process.env.AFRICAS_TALKING_USERNAME !== 'sandbox'
const BASE_URL     = isProduction
  ? 'https://api.africastalking.com/version1/messaging'
  : 'https://api.sandbox.africastalking.com/version1/messaging'

/**
 * Send an SMS. Returns true on success.
 * Failure is non-fatal — the pickup code is always stored in notifications too.
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  const digits     = phone.replace(/\D/g, '')
  const normalized = digits.startsWith('237') ? `+${digits}` : `+237${digits}`

  try {
    const body = new URLSearchParams({
      username: process.env.AFRICAS_TALKING_USERNAME!,
      to:       normalized,
      message,
    })

    const res = await fetch(BASE_URL, {
      method:  'POST',
      headers: {
        'Accept':       'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey':       process.env.AFRICAS_TALKING_API_KEY!,
      },
      body: body.toString(),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[SMS] AT error ${res.status}:`, text)
      return false
    }

    const data = await res.json()
    const recipients = data?.SMSMessageData?.Recipients as Array<{status: string}> | undefined
    const delivered  = recipients?.some(r => r.status === 'Success') ?? false
    if (!delivered) {
      console.warn('[SMS] No successful delivery:', JSON.stringify(data))
    }
    return delivered
  } catch (err) {
    console.error('[SMS] Network error:', err)
    return false
  }
}