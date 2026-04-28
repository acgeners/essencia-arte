"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createOption(formData: FormData) {
  const name = formData.get("name") as string
  const type = formData.get("type") as string
  const price = parseFloat(formData.get("price") as string) || 0
  const isTangible = formData.get("isTangible") === "on"

  if (!name || !type) {
    return { success: false, error: "Nome e Tipo são obrigatórios." }
  }

  const supabase = await createClient()
  
  // 1. Criar a opção
  const { data: option, error: optionError } = await supabase
    .from("options")
    .insert({
      name,
      type,
      price,
      is_tangible: isTangible,
      is_active: true
    })
    .select()
    .single()

  if (optionError || !option) {
    return { success: false, error: optionError?.message || "Erro ao criar opção." }
  }

  // 2. Se for tangível, inicializar o estoque com 0
  if (isTangible) {
    await supabase.from("inventory").insert({
      option_id: option.id,
      quantity: 0
    })
  }

  revalidatePath("/")
  revalidatePath("/admin/opcoes")
  return { success: true }
}

export async function toggleOptionActive(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("options")
    .update({ is_active: !currentStatus })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin/opcoes")
  return { success: true }
}

export async function updateOptionProducts(optionId: string, productIds: string[]) {
  const supabase = await createClient()
  
  // Excluir vínculos antigos
  await supabase.from("product_options").delete().eq("option_id", optionId)
  
  // Inserir novos vínculos se houver
  if (productIds.length > 0) {
    const inserts = productIds.map(pid => ({
      option_id: optionId,
      product_id: pid
    }))
    const { error } = await supabase.from("product_options").insert(inserts)
    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidatePath("/")
  revalidatePath("/pedido/novo")
  revalidatePath("/admin/opcoes")
  return { success: true }
}
