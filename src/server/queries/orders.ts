import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export const getOrders = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("orders")
    .select(`
      id, code, status, customer_name, total, created_at,
      order_items (
        id,
        products (name)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
})

export const getOrderById = cache(async (id: string) => {
  const supabase = await createClient()
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (name),
        primary_color:options!primary_color_id (name),
        secondary_color:options!secondary_color_id (name),
        glitter:options!glitter_id (name),
        tassel_color:options!tassel_color_id (name),
        packaging:options!packaging_id (name),
        shipping:options!shipping_id (name),
        order_item_extras (
          price,
          extra:options!extra_option_id (name)
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return order
})
