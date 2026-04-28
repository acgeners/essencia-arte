"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId)

    if (error) {
      console.error("Erro ao atualizar status:", error)
      return { success: false, error: "Falha ao atualizar status do pedido" }
    }

    // Revalida a página de detalhes e a lista de pedidos
    revalidatePath("/admin/pedidos")
    revalidatePath(`/admin/pedidos/${orderId}`)

    return { success: true }
  } catch (error: any) {
    console.error("Exception:", error)
    return { success: false, error: error.message || "Erro interno" }
  }
}
