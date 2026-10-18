import { createClient } from '@supabase/supabase-js';
import { getEnv } from '@/env';

/**
 * Service-role Supabase client for privileged server-side operations
 * (WhatsApp OTP verification, automated triggers, signed URL generation, and admin seeding).
 */
export function createSupabaseAdminClient() {
  const env = getEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
