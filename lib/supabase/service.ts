import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client for server-side transactions (bookings, admin balance updates).
 * Set SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
