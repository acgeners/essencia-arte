import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

/**
 * Cliente Supabase com Service Role Key.
 * SOMENTE para uso no servidor — NUNCA importar em Client Components.
 * Bypassa RLS — usar com cuidado.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
