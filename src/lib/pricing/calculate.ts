import type { WizardState } from "@/stores/wizard-store"
import type { PriceCalculation } from "@/types/domain"
import { DEFAULT_DEPOSIT_RATE } from "@/lib/constants"
import type { FullCatalog } from "@/server/queries/catalog"



/**
 * Calcula o preço total do pedido baseado no estado do wizard.
 * Função pura — roda no client para feedback instantâneo.
 * Revalidada no servidor ao confirmar.
 */
export function calculatePrice(state: WizardState, catalog: FullCatalog): PriceCalculation {
  const breakdown: Array<{ label: string; value: number }> = []

  // 1. Preço base do modelo
  const model = catalog.products.find((m) => m.id === state.productId)
  const basePrice = model?.basePrice ?? 0
  if (model) {
    breakdown.push({ label: `${model.name}`, value: basePrice })
  }

  // 2. Personalização (nome)
  let personalizationFee = 0
  if (state.personalization.enabled && state.personalization.name.length > 0) {
    //TODO: mover personalizationPrice para DB ou configs. Por enquanto hardcoded 2.0
    personalizationFee = 2.0 
    breakdown.push({ label: "Nome personalizado", value: personalizationFee })
  }

  // 3. Cores (sem custo adicional)
  if (state.colors.primaryId) {
    breakdown.push({ label: "Cor principal", value: 0 })
  }
  if (state.colors.secondaryEnabled && state.colors.secondaryId) {
    breakdown.push({ label: "2ª cor", value: 0 })
  }

  // 4. Glitter (sem custo adicional)
  if (state.glitter.enabled && state.glitter.glitterId) {
    breakdown.push({ label: "Glitter", value: 0 })
  }

  // 5. Adicionais
  let extrasTotal = 0
  for (const extraId of state.extras) {
    const extra = catalog.extras.find((e) => e.id === extraId)
    if (extra) {
      extrasTotal += extra.price
      breakdown.push({ label: extra.name, value: extra.price })
    }
  }

  // 6. Embalagem
  let packagingFee = 0
  if (state.packaging.optionId) {
    const pkg = catalog.packagingOptions.find(
      (p) => p.id === state.packaging.optionId
    )
    if (pkg) {
      packagingFee = pkg.price ?? 0
      if ((pkg.price ?? 0) > 0) {
        breakdown.push({ label: pkg.name, value: pkg.price ?? 0 })
      }
    }
  }

  // 7. Frete
  let shippingFee = 0
  if (state.delivery.shippingOptionId) {
    const ship = catalog.shippingOptions.find(
      (s) => s.id === state.delivery.shippingOptionId
    )
    if (ship) {
      shippingFee = ship.price ?? 0
      breakdown.push({
        label: `Frete: ${ship.name}`,
        value: ship.price ?? 0,
      })
    }
  }

  const subtotal = basePrice + personalizationFee + extrasTotal
  const total = subtotal + packagingFee + shippingFee
  const deposit = Math.ceil(total * DEFAULT_DEPOSIT_RATE * 100) / 100
  const balance = Math.round((total - deposit) * 100) / 100

  return {
    subtotal,
    packagingFee,
    shippingFee,
    total,
    deposit,
    balance,
    breakdown,
  }
}
