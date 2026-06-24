"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const supabase = await createClient()

    if (newStatus === "cancelled") {
      // Cancelar devolvendo o estoque das opções tangíveis (RPC atômico)
      const { error } = await supabase.rpc("cancel_order_restore_stock", {
        p_order_id: orderId,
      })
      if (error) {
        console.error("Erro ao cancelar pedido:", error)
        return { success: false, error: "Falha ao cancelar o pedido" }
      }
    } else {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId)

      if (error) {
        console.error("Erro ao atualizar status:", error)
        return { success: false, error: "Falha ao atualizar status do pedido" }
      }
    }

    // Revalida a página de detalhes e a lista de pedidos
    revalidatePath("/admin/pedidos")
    revalidatePath(`/admin/pedidos/${orderId}`)

    return { success: true }
  } catch (error: unknown) {
    console.error("Exception:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro interno",
    }
  }
}
