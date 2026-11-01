import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getEnv } from '@/env';

let cachedAdminClient: SupabaseClient | null = null;

/**
 * Service-role Supabase client singleton for privileged server-side operations
 * (WhatsApp OTP verification, automated triggers, signed URL generation, and CRM queries).
 */
export function createSupabaseAdminClient(): SupabaseClient {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const env = getEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  cachedAdminClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedAdminClient;
}
