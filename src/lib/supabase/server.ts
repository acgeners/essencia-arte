import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "@/types/database"

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Lê a sessão através dos cookies e aplica as regras RLS do banco.
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorado em Server Components. O proxy.ts já lidará com isso.
          }
        },
      },
    }
  )
})
