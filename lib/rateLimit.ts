import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if real Upstash credentials exist
const hasRealCredentials =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_URL !== 'placeholder' &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_TOKEN !== 'placeholder'

// Auth route limiter — 5 requests per minute
// Falls back to a mock that always allows when credentials are missing
export const authRatelimit = hasRealCredentials
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: false,
    })
  : null

// Call this in auth route handlers
// Returns { success: true } when rate limiting is disabled (dev mode)
export async function checkRateLimit(identifier: string): Promise<{
  success: boolean
  remaining?: number
}> {
  if (!authRatelimit) {
    // Dev fallback — always allow
    return { success: true }
  }

  const result = await authRatelimit.limit(identifier)
  return {
    success: result.success,
    remaining: result.remaining,
  }
}