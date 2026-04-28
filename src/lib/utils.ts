import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina classes CSS com suporte a Tailwind merge.
 * Usa clsx para conditionals e twMerge para resolver conflitos.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Gera uma chave de idempotência única.
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID()
}

/**
 * Delay assíncrono (útil para UX de loading mínimo).
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Slug a partir de texto em pt-BR.
 * @example slugify("Caneta Personalizada") => "caneta-personalizada"
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}
