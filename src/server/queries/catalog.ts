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
    .select("id, name, base_price, category_id, categories!products_category_id_fkey!inner(slug)")
    .eq("categories!products_category_id_fkey.slug", categorySlug)
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
    supabase.from("products").select("id, name, base_price, category_id, images, categories!products_category_id_fkey(slug)").order("name"),
    supabase.from("options").select("id, name, price, product_options(product_id)").eq("type", "color").eq("is_active", true).order("name"),
    supabase.from("options").select("id, name, price, product_options(product_id)").eq("type", "glitter").eq("is_active", true).order("name"),
    supabase.from("options").select("id, name, price, product_options(product_id)").eq("type", "tassel_color").eq("is_active", true).order("name"),
    supabase
      .from("options")
      .select("id, name, price, is_tangible, inventory(quantity), product_options(product_id)")
      .eq("type", "extra")
      .eq("is_active", true)
      .order("name"),
    supabase.from("options").select("id, name, price, product_options(product_id)").eq("type", "packaging").eq("is_active", true).order("name"),
    supabase.from("options").select("id, name, price, product_options(product_id)").eq("type", "shipping").eq("is_active", true).order("name"),
  ])

  // Helper para mapear opções e seus produtos permitidos
  const mapOption = (opt: any) => ({
    id: opt.id,
    name: opt.name,
    price: opt.price ?? 0,
    allowedProducts: Array.isArray(opt.product_options) ? opt.product_options.map((po: any) => po.product_id) : []
  })

  // Mapear extras com informação de estoque
  const extras = (extrasRes.data ?? []).map((extra) => ({
    ...mapOption(extra),
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
      images: (p as any).images as string[] | null ?? [],
      categorySlug: (p as any).categories?.slug ?? (p as any)["categories!products_category_id_fkey"]?.slug ?? "",
    })),
    colors: (colorsRes.data ?? []).map(mapOption),
    glitters: (glittersRes.data ?? []).map(mapOption),
    tasselColors: (tasselColorsRes.data ?? []).map(mapOption),
    extras,
    packagingOptions: (packagingRes.data ?? []).map(mapOption),
    shippingOptions: (shippingRes.data ?? []).map(mapOption),
  }
})

/** Tipo retornado pelo getFullCatalog */
export type FullCatalog = Awaited<ReturnType<typeof getFullCatalog>>
