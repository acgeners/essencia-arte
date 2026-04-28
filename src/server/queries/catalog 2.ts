import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

/**
 * Busca todas as categorias ativas do catálogo.
 * Cacheado por request via React cache().
 */
export const getCategories = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("name")

  if (error) throw error
  return data
})

/**
 * Busca todos os produtos de uma categoria.
 */
export const getProductsByCategory = cache(async (categorySlug: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("id, name, base_price, category_id, categories!inner(slug)")
    .eq("categories.slug", categorySlug)
    .order("name")

  if (error) throw error
  return data
})

/**
 * Busca todas as opções ativas de um determinado tipo.
 */
export const getOptionsByType = cache(async (type: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("options")
    .select("id, name, price, is_tangible, is_active")
    .eq("type", type)
    .eq("is_active", true)
    .order("name")

  if (error) throw error
  return data
})

/**
 * Busca todo o catálogo de uma vez (para o wizard).
 * Retorna categorias, cores, glitters, tassel colors, extras (com estoque), embalagens e fretes.
 */
export const getFullCatalog = cache(async () => {
  const supabase = await createClient()

  const [
    categoriesRes,
    productsRes,
    colorsRes,
    glittersRes,
    tasselColorsRes,
    extrasRes,
    packagingRes,
    shippingRes,
  ] = await Promise.all([
    supabase.from("categories").select("id, slug, name").order("name"),
    supabase.from("products").select("id, name, base_price, category_id, categories(slug)").order("name"),
    supabase.from("options").select("id, name, price").eq("type", "color").eq("is_active", true).order("name"),
    supabase.from("options").select("id, name, price").eq("type", "glitter").eq("is_active", true).order("name"),
    supabase.from("options").select("id, name, price").eq("type", "tassel_color").eq("is_active", true).order("name"),
    supabase
      .from("options")
      .select("id, name, price, is_tangible, inventory(quantity)")
      .eq("type", "extra")
      .eq("is_active", true)
      .order("name"),
    supabase.from("options").select("id, name, price").eq("type", "packaging").eq("is_active", true).order("name"),
    supabase.from("options").select("id, name, price").eq("type", "shipping").eq("is_active", true).order("name"),
  ])

  // Mapear extras com informação de estoque
  const extras = (extrasRes.data ?? []).map((extra) => ({
    id: extra.id,
    name: extra.name,
    price: extra.price ?? 0,
    inStock:
      !extra.is_tangible ||
      (Array.isArray(extra.inventory) && extra.inventory.length > 0
        ? (extra.inventory[0] as any).quantity > 0
        : true),
  }))

  return {
    categories: categoriesRes.data ?? [],
    products: (productsRes.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      basePrice: p.base_price,
      categorySlug: (p.categories as any)?.slug ?? "",
    })),
    colors: colorsRes.data ?? [],
    glitters: glittersRes.data ?? [],
    tasselColors: tasselColorsRes.data ?? [],
    extras,
    packagingOptions: packagingRes.data ?? [],
    shippingOptions: shippingRes.data ?? [],
  }
})

/** Tipo retornado pelo getFullCatalog */
export type FullCatalog = Awaited<ReturnType<typeof getFullCatalog>>
