"use server"

import { createClient } from "@/lib/supabase/server"

export interface TrackedOrder {
  code: string
  status: string
  createdAt: string | null
  productName: string
}

/**
 * Busca um pedido pelo código (lookup público — o código é o "segredo").
 * Retorna apenas dados não-sensíveis para a tela de acompanhamento.
 */
export async function trackOrder(code: string): Promise<TrackedOrder | null> {
  const term = code.trim()
  if (!term) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select("code, status, created_at, order_items(products(name))")
    .ilike("code", term)
    .maybeSingle()

  if (!data) return null

  const items = (data.order_items ?? []) as Array<{
    products: { name: string | null } | null
  }>

  return {
    code: data.code,
    status: data.status,
    createdAt: data.created_at,
    productName: items[0]?.products?.name ?? "Pedido personalizado",
  }
}
