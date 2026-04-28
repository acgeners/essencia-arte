"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^\w\s-]/g, "") // remove caracteres especiais
    .replace(/[\s_-]+/g, "-") // troca espaços por hífen
    .replace(/^-+|-+$/g, "") // remove hífens no começo e fim
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string

  if (!name) {
    return { success: false, error: "O nome da categoria é obrigatório." }
  }

  const slug = generateSlug(name)
  const supabase = await createClient()
  
  const { error } = await supabase.from("categories").insert({
    name,
    slug,
  })

  if (error) {
    console.error("Erro ao criar categoria:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin/categorias")
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string

  if (!name) {
    return { success: false, error: "O nome da categoria é obrigatório." }
  }

  const slug = generateSlug(name)
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("categories")
    .update({ name, slug })
    .eq("id", id)

  if (error) {
    console.error("Erro ao atualizar categoria:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin/categorias")
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  
  // O Supabase (via foreign key sem cascade) impediria deletar categorias com produtos.
  // Vamos deixar a tentativa e exibir o erro (ou seria melhor dar update em cascade, mas a regra do DB é segura).
  const { error } = await supabase.from("categories").delete().eq("id", id)

  if (error) {
    console.error("Erro ao excluir categoria:", error)
    return { success: false, error: "Não é possível excluir categorias que já contêm produtos." }
  }

  revalidatePath("/")
  revalidatePath("/admin/categorias")
  return { success: true }
}
