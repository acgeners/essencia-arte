import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

/**
 * Cria um cliente Supabase para uso no browser (Client Components).
 * Usa as variáveis NEXT_PUBLIC_* que são expostas ao client.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
