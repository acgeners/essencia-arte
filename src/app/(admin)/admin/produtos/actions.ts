"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

async function uploadProductImage(file: File): Promise<string | null> {
  const adminSupabase = createAdminClient()
  const ext = file.name.split(".").pop() ?? "jpg"
  const path = `products/${Date.now()}.${ext}`
  const { error } = await adminSupabase.storage
    .from("essencia_arte")
    .upload(path, file, { upsert: true })
  if (error) {
    console.error("Erro ao fazer upload da imagem:", error)
    return null
  }
  const { data } = adminSupabase.storage.from("essencia_arte").getPublicUrl(path)
  return data.publicUrl
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string
  const basePrice = parseFloat(formData.get("basePrice") as string)
  const categoryIds = formData.getAll("categoryIds") as string[]
  const optionIds = formData.getAll("optionIds") as string[]
  const imageFiles = formData.getAll("imageFiles") as File[]

  if (!name || isNaN(basePrice) || categoryIds.length === 0) {
    return { success: false, error: "Preencha o nome, preço e ao menos uma categoria." }
  }

  const images: string[] = []
  for (const file of imageFiles) {
    if (file && file.size > 0) {
      const url = await uploadProductImage(file)
      if (url) images.push(url)
    }
  }

  const supabase = await createClient()

  // 1. Criar o produto
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      name,
      base_price: basePrice,
      category_id: categoryIds[0],
      images,
      option_ids: optionIds,
    })
    .select()
    .single()

  if (productError || !product) {
    console.error("Erro ao criar produto:", productError)
    return { success: false, error: productError?.message || "Erro ao criar produto" }
  }

  // 2. Criar vínculos de categorias
  const categoryLinks = categoryIds.map(catId => ({
    product_id: product.id,
    category_id: catId
  }))
  await supabase.from("product_category_links").insert(categoryLinks)

  // 3. Criar vínculos de opções (junction table)
  if (optionIds.length > 0) {
    const optionLinks = optionIds.map(optId => ({
      product_id: product.id,
      option_id: optId
    }))
    await supabase.from("product_options").insert(optionLinks)
  }

  revalidatePath("/")
  revalidatePath("/admin/produtos")
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const basePrice = parseFloat(formData.get("basePrice") as string)
  const categoryIds = formData.getAll("categoryIds") as string[]
  const optionIds = formData.getAll("optionIds") as string[]
  const imageFiles = formData.getAll("imageFiles") as File[]
  const existingImageUrls = (formData.getAll("existingImageUrls") as string[]).filter(Boolean)

  if (!name || isNaN(basePrice) || categoryIds.length === 0) {
    return { success: false, error: "Preencha os campos obrigatórios." }
  }

  const images: string[] = [...existingImageUrls]
  for (const file of imageFiles) {
    if (file && file.size > 0) {
      const url = await uploadProductImage(file)
      if (url) images.push(url)
    }
  }

  const supabase = await createClient()

  // 1. Atualizar produto
  const { error: updateError } = await supabase
    .from("products")
    .update({
      name,
      base_price: basePrice,
      category_id: categoryIds[0],
      images,
      option_ids: optionIds,
    })
    .eq("id", id)

  if (updateError) {
    console.error("Erro ao atualizar produto:", updateError)
    return { success: false, error: updateError.message }
  }

  // 2. Atualizar categorias (Limpar e Re-inserir)
  await supabase.from("product_category_links").delete().eq("product_id", id)
  const categoryLinks = categoryIds.map(catId => ({
    product_id: id,
    category_id: catId
  }))
  await supabase.from("product_category_links").insert(categoryLinks)

  // 3. Atualizar opções (Limpar e Re-inserir)
  await supabase.from("product_options").delete().eq("product_id", id)
  if (optionIds.length > 0) {
    const optionLinks = optionIds.map(optId => ({
      product_id: id,
      option_id: optId
    }))
    await supabase.from("product_options").insert(optionLinks)
  }

  revalidatePath("/")
  revalidatePath("/admin/produtos")
  return { success: true }
}

export async function createCategory(name: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug })
    .select("id, name")
    .single()

  if (error) {
    console.error("Erro ao criar categoria:", error)
    return { success: false as const, error: error.message }
  }

  revalidatePath("/admin/produtos")
  return { success: true as const, category: data }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir produto:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin/produtos")
  return { success: true }
}
