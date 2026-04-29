import { createClient } from "@/lib/supabase/server"

export async function getAdminProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_category_links (category_id, categories(id, name)),
      product_options (option_id, options(id, type))
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
