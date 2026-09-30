import { z } from 'zod'

/**
 * Public client env. Secrets must never use VITE_ prefixes.
 * Validated once at boot; fails loudly on malformed public config.
 *
 * Important: always read import.meta.env.VITE_* as static property access.
 * Assigning import.meta.env to a variable can cause Vite to inline the entire env object.
 */
const publicEnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().optional().default(''),
  VITE_SUPABASE_ANON_KEY: z.string().optional().default(''),
  VITE_VAPID_PUBLIC_KEY: z.string().optional().default(''),
  VITE_RAZORPAY_KEY_ID: z.string().optional().default(''),
  VITE_DEFAULT_SCHOOL_CODE: z.string().optional().default('SUNRISE'),
  VITE_DEFAULT_CLASS_NAME: z.string().optional().default('Grade 8-A'),
  VITE_ENABLE_DEMO_FIXTURES: z.string().optional().default(''),
  DEV: z.boolean().optional(),
  PROD: z.boolean().optional(),
  MODE: z.string().optional(),
})

export type PublicEnv = z.infer<typeof publicEnvSchema>

function readRaw(): Record<string, unknown> {
  return {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_VAPID_PUBLIC_KEY: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    VITE_RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID,
    VITE_DEFAULT_SCHOOL_CODE: import.meta.env.VITE_DEFAULT_SCHOOL_CODE,
    VITE_DEFAULT_CLASS_NAME: import.meta.env.VITE_DEFAULT_CLASS_NAME,
    VITE_ENABLE_DEMO_FIXTURES: import.meta.env.VITE_ENABLE_DEMO_FIXTURES,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    MODE: import.meta.env.MODE,
  }
}

let cached: PublicEnv | null = null

export function getPublicEnv(): PublicEnv {
  if (cached) return cached
  const parsed = publicEnvSchema.safeParse(readRaw())
  if (!parsed.success) {
    throw new Error(`Invalid public env: ${parsed.error.message}`)
  }
  cached = parsed.data
  return cached
}

export function isSupabasePublicConfigured(): boolean {
  const e = getPublicEnv()
  return Boolean(e.VITE_SUPABASE_URL.trim() && e.VITE_SUPABASE_ANON_KEY.trim())
}

export function demoFixturesEnabled(): boolean {
  const e = getPublicEnv()
  if (e.PROD) return false
  return e.VITE_ENABLE_DEMO_FIXTURES === '1' || e.VITE_ENABLE_DEMO_FIXTURES === 'true'
}
