import { z } from 'zod';

const DEFAULT_SUPABASE_URL = 'https://eaedageblastckatwfcn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhZWRhZ2VibGFzdGNrYXR3ZmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNDU3NjMsImV4cCI6MjEwNzkyMTc2M30.DQ6pJmu3VB_36AwLmdOBbGaDk6Xy_Q93v3j5o5YG8ZM';

/**
 * Client-safe schema for NEXT_PUBLIC_* environment variables.
 * Uses static process.env.NEXT_PUBLIC_* references so Next.js inlines them into browser bundles
 * without ever throwing or crashing client hydration.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default(DEFAULT_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default(DEFAULT_SUPABASE_ANON_KEY),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_PROJECT_REF: z.string().default('eaedageblastckatwfcn'),
  WHATSAPP_SANDBOX_OTP: z.string().default('123456'),
  WHATSAPP_ACCESS_TOKEN: z.string().default('sandbox_token'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().default('sandbox_phone_id'),
  WHATSAPP_VERIFY_TOKEN: z.string().default('physiolab_verify_token_2026'),
});

export function getPublicEnv() {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  });

  if (parsed.success) {
    return parsed.data;
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: DEFAULT_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: DEFAULT_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  };
}

export function getEnv() {
  const publicEnv = getPublicEnv();
  const parsed = serverEnvSchema.safeParse({
    ...publicEnv,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF || 'eaedageblastckatwfcn',
    WHATSAPP_SANDBOX_OTP: process.env.WHATSAPP_SANDBOX_OTP || '123456',
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || 'sandbox_token',
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || 'sandbox_phone_id',
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'physiolab_verify_token_2026',
  });

  if (parsed.success) {
    return parsed.data;
  }

  return {
    ...publicEnv,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_PROJECT_REF: 'eaedageblastckatwfcn',
    WHATSAPP_SANDBOX_OTP: '123456',
    WHATSAPP_ACCESS_TOKEN: 'sandbox_token',
    WHATSAPP_PHONE_NUMBER_ID: 'sandbox_phone_id',
    WHATSAPP_VERIFY_TOKEN: 'physiolab_verify_token_2026',
  };
}
