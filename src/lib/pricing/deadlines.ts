import type { WizardState } from "@/stores/wizard-store"
import type { FullCatalog } from "@/server/queries/catalog"

export interface DeadlineEstimate {
  productionMin: number
  productionMax: number
  shippingMin: number
  shippingMax: number
  totalMin: number
  totalMax: number
  estimatedDate: Date
  productionLabel: string
  shippingLabel: string
  deliveryLabel: string
}

const DEFAULT_PRODUCTION_MIN = 3
const DEFAULT_PRODUCTION_MAX = 5

function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day !== 0 && day !== 6) added++
  }
  return d
}

function formatDateBR(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export function estimateDeadlines(
  state: WizardState,
  catalog: FullCatalog,
  now: Date = new Date()
): DeadlineEstimate {
  const product = state.productId
    ? catalog.products.find((item) => item.id === state.productId)
    : null
  const productionMin = product?.productionDaysMin ?? DEFAULT_PRODUCTION_MIN
  const productionMax = product?.productionDaysMax ?? DEFAULT_PRODUCTION_MAX

  const shipping = state.delivery.shippingOptionId
    ? catalog.shippingOptions.find((s) => s.id === state.delivery.shippingOptionId)
    : null
  const quote =
    state.delivery.shippingQuote && state.delivery.shippingQuote.optionId === shipping?.id
      ? state.delivery.shippingQuote
      : null

  const shippingDaysByName = (name?: string): { min: number; max: number } => {
    if (!name) return { min: 0, max: 0 }
    const n = name.toLowerCase()
    if (n.includes("pac")) return { min: 5, max: 8 }
    if (n.includes("sedex")) return { min: 1, max: 3 }
    if (n.includes("transp")) return { min: 1, max: 5 }
    return { min: 0, max: 0 }
  }
  const inferred = quote
    ? {
        min: quote.minDays,
        max: quote.maxDays,
      }
    : shippingDaysByName(shipping?.name)
  const shippingMin = inferred.min
  const shippingMax = inferred.max

  const totalMin = productionMin + shippingMin
  const totalMax = productionMax + shippingMax

  const estimatedDate = addBusinessDays(now, totalMax)

  const productionLabel = `${productionMin} a ${productionMax} dias úteis`
  const shippingLabel =
    state.delivery.type === "pickup"
      ? "Retirada local"
      : state.delivery.type === "transportadora"
      ? "A combinar"
      : shipping
      ? `${shipping.name} ${shippingMin} a ${shippingMax} dias úteis`
      : "Selecione modalidade"

  const deliveryLabel =
    state.delivery.type === "pickup"
      ? `Disponível em ${productionMax} dias úteis`
      : state.delivery.type === "transportadora"
      ? "A combinar"
      : shipping
      ? formatDateBR(estimatedDate)
      : "Calcular frete"

  return {
    productionMin,
    productionMax,
    shippingMin,
    shippingMax,
    totalMin,
    totalMax,
    estimatedDate,
    productionLabel,
    shippingLabel,
    deliveryLabel,
  }
}
