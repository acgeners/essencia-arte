"use client"

import type { PriceCalculation } from "@/types/domain"
import { formatBRL } from "@/lib/format"
import { Separator } from "@/components/ui/separator"
import { Heart, Calendar, Package } from "lucide-react"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { useWizardStore } from "@/stores/wizard-store"

export interface SummaryDeadlines {
  productionLabel: string
  deliveryLabel: string
}

interface OrderSummaryPanelProps {
  pricing: PriceCalculation
  deadlines?: SummaryDeadlines
}

export function OrderSummaryPanel({ pricing, deadlines }: OrderSummaryPanelProps) {
  const state = useWizardStore()
  const catalog = useCatalog()
  const product = state.productId
    ? catalog.products.find((item) => item.id === state.productId)
    : null
  const productImage = product?.images?.[0] ?? null
  const primaryColor = state.colors.primaryId
    ? catalog.colors.find((item) => item.id === state.colors.primaryId)
    : null
  const secondaryColor = state.colors.secondaryId
    ? catalog.colors.find((item) => item.id === state.colors.secondaryId)
    : null
  const glitter = state.glitter.glitterId
    ? catalog.glitters.find((item) => item.id === state.glitter.glitterId)
    : null
  const tassel = state.glitter.tasselColorId
    ? catalog.tasselColors.find((item) => item.id === state.glitter.tasselColorId)
    : null
  const packaging = state.packaging.optionId
    ? catalog.packagingOptions.find((item) => item.id === state.packaging.optionId)
    : null
  const shipping = state.delivery.shippingOptionId
    ? catalog.shippingOptions.find((item) => item.id === state.delivery.shippingOptionId)
    : null

  const rows: Array<{
    label: string
    detail?: string
    value: number
    included?: boolean
  }> = []

  if (state.colors.primaryId) {
    rows.push({
      label: "Cor principal",
      detail: primaryColor?.name ?? "Selecionada",
      value: 0,
      included: true,
    })
  }
  if (state.colors.secondaryEnabled && state.colors.secondaryId) {
    rows.push({
      label: "Cor secundária",
      detail: secondaryColor?.name ?? "Selecionada",
      value: 0,
      included: true,
    })
  }
  if (state.glitter.enabled && state.glitter.glitterId) {
    rows.push({
      label: "Glitter",
      detail: glitter?.name ?? "Selecionado",
      value: 0,
      included: true,
    })
  }
  if (state.glitter.enabled && state.glitter.tasselColorId) {
    rows.push({
      label: "Cor do tassel",
      detail: tassel?.name ?? "Selecionada",
      value: 0,
      included: true,
    })
  }
  if (state.personalization.enabled && state.personalization.name) {
    rows.push({
      label: "Nome personalizado",
      detail: state.personalization.name,
      value: 2,
    })
  }
  for (const extraId of state.extras) {
    const extra = catalog.extras.find((item) => item.id === extraId)
    if (extra) {
      rows.push({ label: "Adicional", detail: extra.name, value: extra.price })
    }
  }
  if (packaging) {
    rows.push({
      label: "Embalagem",
      detail: packaging.name,
      value: packaging.price ?? 0,
      included: (packaging.price ?? 0) === 0,
    })
  }
  if (shipping) {
    rows.push({
      label: "Entrega",
      detail:
        state.delivery.type === "correios" && state.delivery.cep
          ? `${shipping.name} • CEP ${state.delivery.cep.slice(0, 5)}-${state.delivery.cep.slice(5)}`
          : shipping.name,
      value: pricing.shippingFee,
      included: pricing.shippingFee === 0,
    })
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
      <h3 className="font-display text-lg font-semibold text-primary">
        Resumo do pedido
      </h3>

      {product ? (
        <div className="mt-4 flex gap-3 rounded-[var(--radius-lg)] border border-border bg-muted/25 p-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-background">
            {productImage ? (
              <img
                src={productImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Produto
            </p>
            <p className="mt-0.5 line-clamp-2 text-base font-bold leading-snug text-foreground">
              {product.name}
            </p>
            <p className="mt-1 text-sm font-semibold text-primary">
              {formatBRL(product.basePrice)}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Selecione um modelo para ver o resumo
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-4 space-y-2.5">
          {rows.map((item, i) => (
            <div key={`${item.label}-${i}`} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="text-muted-foreground">{item.label}</p>
                {item.detail && (
                  <p className="truncate font-medium text-foreground">{item.detail}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                {item.value > 0 ? (
                  <span className="font-medium text-foreground">+ {formatBRL(item.value)}</span>
                ) : (
                  <span className="text-[11px] font-medium text-muted-foreground">Incluso</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pricing.total > 0 && (
        <>
          <Separator className="my-4" />
          <div className="flex items-center justify-between pt-2">
            <span className="text-base font-semibold text-foreground">TOTAL</span>
            <span className="text-xl font-bold text-primary">{formatBRL(pricing.total)}</span>
          </div>

          {deadlines && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-[var(--radius-md)] border border-border bg-muted/30 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Package className="h-3 w-3" />
                  Prazo de produção
                </div>
                <p className="mt-1 text-xs font-semibold text-foreground">
                  {deadlines.productionLabel}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border bg-muted/30 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Prazo de entrega
                </div>
                <p className="mt-1 text-xs font-semibold text-foreground">
                  {deadlines.deliveryLabel}
                </p>
              </div>
            </div>
          )}

          <p className="mt-3 text-[10px] text-muted-foreground">
            * Prazo total inclui produção + envio.
          </p>

          <div className="mt-3 rounded-[var(--radius-md)] bg-primary/5 px-3 py-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Entrada (50%)</span>
              <span className="font-semibold text-primary">{formatBRL(pricing.deposit)}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-muted-foreground">Restante na entrega</span>
              <span className="font-medium text-foreground">{formatBRL(pricing.balance)}</span>
            </div>
          </div>
        </>
      )}

      <div className="mt-4 text-center">
        <p className="text-[10px] text-muted-foreground">
          Feito com <Heart className="inline h-2.5 w-2.5 fill-primary text-primary" /> por Essência & Arte
        </p>
      </div>
    </div>
  )
}
