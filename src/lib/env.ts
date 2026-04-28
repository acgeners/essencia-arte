import { z } from "zod"

/**
 * Schema de validação para variáveis de ambiente do servidor.
 * Nunca exponha essas variáveis no client-side.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY é obrigatória"),
  SUPABASE_JWT_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  WHATSAPP_BUSINESS_NUMBER: z.string().optional(),
  PIX_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
})

/**
 * Schema de validação para variáveis de ambiente públicas.
 * Estas são expostas no client via prefix NEXT_PUBLIC_.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY é obrigatória"),
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL deve ser uma URL válida"),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type PublicEnv = z.infer<typeof publicEnvSchema>

/**
 * Valida e retorna as variáveis de ambiente do servidor.
 * Lança erro imediatamente se faltar algo em produção.
 */
function validateServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env)

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const message = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n")

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `❌ Variáveis de ambiente do servidor inválidas:\n${message}`
      )
    }

    console.warn(
      `⚠️ Variáveis de ambiente do servidor inválidas (dev mode):\n${message}`
    )
  }

  return (parsed.data ?? {}) as ServerEnv
}

/**
 * Valida e retorna as variáveis de ambiente públicas.
 */
function validatePublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  })

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    const message = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n")

    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `❌ Variáveis de ambiente públicas inválidas:\n${message}`
      )
    }

    console.warn(
      `⚠️ Variáveis de ambiente públicas inválidas (dev mode):\n${message}`
    )
  }

  return (parsed.data ?? {}) as PublicEnv
}

export const serverEnv = validateServerEnv()
export const publicEnv = validatePublicEnv()
