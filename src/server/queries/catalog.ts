import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

type ProductOptionLink = { product_id: string | null }

type CatalogOptionRow = {
  id: string
  name: string
  price: number | null
  product_options?: ProductOptionLink[] | null
}

type ExtraOptionRow = CatalogOptionRow & {
  is_tangible: boolean | null
  inventory?: { quantity: number | null }[] | null
}

type CatalogProductRow = {
  id: string
  name: string
  base_price: number
  production_days_min?: number | null
  production_days_max?: number | null
  images?: string[] | null
  categories?: { slug: string | null } | null
}

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
    supabase.from("products").select("id, name, base_price, production_days_min, production_days_max, category_id, images, categories!products_category_id_fkey(slug)").order("name"),
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
  const mapOption = (opt: CatalogOptionRow) => ({
    id: opt.id,
    name: opt.name,
    price: opt.price ?? 0,
    allowedProducts: Array.isArray(opt.product_options)
      ? opt.product_options.map((po) => po.product_id).filter(Boolean)
      : [],
  })

  // Mapear extras com informação de estoque
  const extras = ((extrasRes.data ?? []) as ExtraOptionRow[]).map((extra) => ({
    ...mapOption(extra),
    inStock:
      !extra.is_tangible ||
      (Array.isArray(extra.inventory) && extra.inventory.length > 0
        ? (extra.inventory[0]?.quantity ?? 0) > 0
        : true),
  }))

  return {
    categories: categoriesRes.data ?? [],
    products: ((productsRes.data ?? []) as CatalogProductRow[]).map((p) => ({
      id: p.id,
      name: p.name,
      basePrice: p.base_price,
      productionDaysMin: p.production_days_min ?? 3,
      productionDaysMax: p.production_days_max ?? 5,
      images: p.images ?? [],
      categorySlug: p.categories?.slug ?? "",
    })),
    colors: ((colorsRes.data ?? []) as CatalogOptionRow[]).map(mapOption),
    glitters: ((glittersRes.data ?? []) as CatalogOptionRow[]).map(mapOption),
    tasselColors: ((tasselColorsRes.data ?? []) as CatalogOptionRow[]).map(mapOption),
    extras,
    packagingOptions: ((packagingRes.data ?? []) as CatalogOptionRow[]).map(mapOption),
    shippingOptions: ((shippingRes.data ?? []) as CatalogOptionRow[]).map(mapOption),
  }
})

/** Tipo retornado pelo getFullCatalog */
export type FullCatalog = Awaited<ReturnType<typeof getFullCatalog>>
