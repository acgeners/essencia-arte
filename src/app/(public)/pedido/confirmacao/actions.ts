"use server"

import { getFullCatalog } from "@/server/queries/catalog"
import { calculatePrice } from "@/lib/pricing/calculate"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { WizardState } from "@/stores/wizard-store"

interface CustomerData {
  name: string
  phone: string
  email: string
  notes: string
}

export async function createOrderAction(
  state: WizardState,
  customerData: CustomerData
) {
  try {
    const catalog = await getFullCatalog()

    // 1. Validar e Recalcular Preço no Servidor
    const pricing = calculatePrice(state, catalog)

    if (!state.productId) {
      throw new Error("Produto não selecionado")
    }

    const admin = createAdminClient()
    let customerId: string | null = null

    // 2. Lógica de Autenticação Silenciosa
    if (customerData.email) {
      // Tentar encontrar usuário existente por e-mail
      const { data: existingUsers } = await admin.auth.admin.listUsers()
      const user = existingUsers?.users.find(u => u.email === customerData.email)

      if (user) {
        customerId = user.id
      } else {
        // Criar novo usuário silenciosamente
        const { data: newUser } = await admin.auth.admin.createUser({
          email: customerData.email,
          password: Math.random().toString(36).slice(-12), // Senha aleatória
          email_confirm: true, // Auto-confirmar
          user_metadata: {
            full_name: customerData.name,
            phone: customerData.phone
          }
        })

        if (newUser?.user) {
          customerId = newUser.user.id
        }
      }
    }

    // Preparar extras como JSONB
    const extras = state.extras.map((extraId) => {
      const extra = catalog.extras.find((e) => e.id === extraId)
      return {
        id: extraId,
        price: extra?.price ?? 0,
      }
    })

    const supabase = await createClient()

    // 3. Chamar a RPC para criar o pedido e descontar estoque
    const payload = {
      p_customer_name: customerData.name,
      p_customer_phone: customerData.phone,
      p_customer_email: customerData.email || null,
      p_customer_notes: customerData.notes || null,
      p_subtotal: pricing.subtotal,
      p_shipping_cost: pricing.shippingFee,
      p_total: pricing.total,
      p_deposit: pricing.deposit,
      p_balance: pricing.balance,
      p_product_id: state.productId,
      p_personalization_name: state.personalization.enabled ? state.personalization.name : null,
      p_primary_color_id: state.colors.primaryId || null,
      p_secondary_color_id: state.colors.secondaryEnabled ? state.colors.secondaryId : null,
      p_glitter_id: state.glitter.enabled ? state.glitter.glitterId : null,
      p_tassel_color_id: state.glitter.enabled ? state.glitter.tasselColorId : null,
      p_packaging_id: state.packaging.optionId || null,
      p_shipping_id: state.delivery.shippingOptionId || null,
      p_item_price: pricing.subtotal,
      p_extras: extras,
      p_customer_id: customerId // Novo parâmetro vinculado
    }

    const { data, error } = await supabase.rpc("create_order_with_stock_check", payload as never)

    if (error) {
      console.error("RPC Error:", error)
      if (error.message.includes("fora de estoque")) {
        return { success: false, error: "Desculpe, um ou mais itens acabaram de esgotar do nosso estoque." }
      }
      return { success: false, error: "Ocorreu um erro ao salvar o pedido." }
    }

    return { success: true, orderId: data }
  } catch (err: unknown) {
    console.error("Action Error:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido ao processar o pedido.",
    }
  }
}
