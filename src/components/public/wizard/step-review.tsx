"use client"

import { CheckCircle2, Gift, Palette, ShoppingBag, Sparkles, Truck } from "lucide-react"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { OrderSummaryPanel } from "@/components/public/wizard/order-summary-panel"
import { calculatePrice } from "@/lib/pricing/calculate"
import { useWizardStore } from "@/stores/wizard-store"

export function StepReview() {
  const catalog = useCatalog()
  const state = useWizardStore()
  const pricing = calculatePrice(state, catalog)

  const categoryName =
    catalog.categories.find((category) => category.slug === state.categorySlug)?.name ?? "-"
  const productName =
    catalog.products.find((product) => product.id === state.productId)?.name ?? "-"
  const primaryColor =
    catalog.colors.find((color) => color.id === state.colors.primaryId)?.name ?? "-"
  const secondaryColor = state.colors.secondaryEnabled
    ? catalog.colors.find((color) => color.id === state.colors.secondaryId)?.name ?? "-"
    : "Não"
  const glitterName = state.glitter.enabled
    ? catalog.glitters.find((glitter) => glitter.id === state.glitter.glitterId)?.name ?? "-"
    : "Não"
  const tasselColor = state.glitter.enabled
    ? catalog.tasselColors.find((color) => color.id === state.glitter.tasselColorId)?.name ?? "-"
    : null
  const extras = state.extras
    .map((id) => catalog.extras.find((extra) => extra.id === id)?.name)
    .filter(Boolean)
  const packaging =
    state.packaging.type === "gift"
      ? catalog.packagingOptions.find((option) => option.id === state.packaging.optionId)?.name ?? "Presente"
      : "Sem embalagem para presente"
  const delivery =
    state.delivery.type === "pickup"
      ? "Retirada"
      : catalog.shippingOptions.find((option) => option.id === state.delivery.shippingOptionId)?.name ?? "-"

  return (
    <div>
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-1 h-6 w-6 text-primary" />
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Revise seu pedido
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Confira os detalhes antes de finalizar.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <ReviewSection icon={<ShoppingBag />} title="Produto">
            <ReviewRow label="Categoria" value={categoryName} />
            <ReviewRow label="Modelo" value={productName} />
          </ReviewSection>

          <ReviewSection icon={<Palette />} title="Cores">
            <ReviewRow label="Cor principal" value={primaryColor} />
            <ReviewRow label="Cor secundária" value={secondaryColor} />
          </ReviewSection>

          <ReviewSection icon={<Sparkles />} title="Acabamentos">
            <ReviewRow label="Glitter" value={glitterName} />
            {tasselColor && <ReviewRow label="Cor do tassel" value={tasselColor} />}
            <ReviewRow
              label="Nome"
              value={state.personalization.enabled && state.personalization.name ? state.personalization.name : "Não"}
            />
            <ReviewRow label="Adicionais" value={extras.length > 0 ? extras.join(", ") : "Nenhum"} />
          </ReviewSection>

          <ReviewSection icon={<Gift />} title="Embalagem">
            <ReviewRow label="Tipo" value={packaging} />
            {state.packaging.type === "gift" && state.packaging.message && (
              <ReviewRow label="Mensagem" value={state.packaging.message} />
            )}
          </ReviewSection>

          <ReviewSection icon={<Truck />} title="Entrega">
            <ReviewRow label="Opção" value={delivery} />
            {state.delivery.type === "correios" && state.delivery.cep && (
              <ReviewRow label="CEP" value={state.delivery.cep} />
            )}
          </ReviewSection>
        </div>

        <OrderSummaryPanel pricing={pricing} />
      </div>
    </div>
  )
}

function ReviewSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-muted/20 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-primary [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
        {title}
      </h3>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium text-foreground">{value}</span>
    </div>
  )
}
