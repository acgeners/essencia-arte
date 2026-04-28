import { createClient } from "@/lib/supabase/server"

export async function getAdminProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories!product_category_links (id, name),
      product_category_links (category_id),
      product_options (option_id)
    `)
    .order("name")

  if (error) throw error
  return data
}

export async function getAdminCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name")

  if (error) throw error
  return data
}
