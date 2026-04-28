import { createClient } from "@/lib/supabase/server"

export async function getAdminOptions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("options")
    .select("*, product_options(product_id)")
    .order("type")
    .order("name")

  if (error) throw error
  return data
}

export async function getBasicProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name")
    .order("name")

  if (error) throw error
  return data
}
