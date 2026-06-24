/**
 * Tipos de domínio do Essência & Arte.
 *
 * NOTA: contém apenas os tipos de cálculo de preço usados pelo wizard.
 * As entidades de banco (Product, Order, Customer, etc.) vivem em
 * `@/types/database` (geradas a partir do schema Supabase) — não duplicar aqui.
 */

/** Breakdown de preço do wizard */
export interface PriceBreakdown {
  label: string
  value: number
}

/** Resultado do cálculo de preço */
export interface PriceCalculation {
  subtotal: number
  shippingFee: number
  total: number
  deposit: number
  balance: number
  breakdown: PriceBreakdown[]
}
