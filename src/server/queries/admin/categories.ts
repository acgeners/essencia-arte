import { createClient } from "@/lib/supabase/server"

export async function getAdminCategoriesList() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(id)")
    .order("name")

  if (error) throw error

  return data.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    productsCount: Array.isArray(cat.products) ? cat.products.length : 0
  }))
}
