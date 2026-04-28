"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateInventory(optionId: string, newQuantity: number) {
  if (newQuantity < 0) {
    return { success: false, error: "A quantidade não pode ser negativa." }
  }

  const supabase = await createClient()
  
  // Tentar atualizar
  const { error } = await supabase
    .from("inventory")
    .update({ quantity: newQuantity })
    .eq("option_id", optionId)

  if (error) {
    console.error("Erro ao atualizar estoque:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin/estoque")
  revalidatePath("/pedido/novo")
  return { success: true }
}
