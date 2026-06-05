import { createClient } from '@supabase/supabase-js'

// This client bypasses Row Level Security.
// Use ONLY in Route Handlers for operations that need to read data
// immediately after auth calls (before session cookies are set).
// NEVER import this file in client components or pages.

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. This is required for server-side operations.')
}

export const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)