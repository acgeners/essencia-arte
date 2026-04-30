"use client"

import Image from "next/image"
import { Heart, Sparkles, Award, Gift, Package, Truck, Calendar, Check } from "lucide-react"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { calculatePrice } from "@/lib/pricing/calculate"
import { estimateDeadlines } from "@/lib/pricing/deadlines"
import { useWizardStore } from "@/stores/wizard-store"
import { formatBRL } from "@/lib/format"

const TRUST_ITEMS = [
  { icon: Heart, label: "Feito", strong: "com amor" },
  { icon: Sparkles, label: "Personalizado", strong: "do seu jeito" },
  { icon: Award, label: "Materiais", strong: "de qualidade" },
  { icon: Gift, label: "Embalagem", strong: "para encantar" },
]

export function StepReview() {
  const catalog = useCatalog()
  const state = useWizardStore()
  const pricing = calculatePrice(state, catalog)
  const deadlines = estimateDeadlines(state, catalog)

  const product = catalog.products.find((p) => p.id === state.productId)
  const productName = product?.name ?? "—"
  const productImage = product?.images?.[0] ?? null
  const primaryColor =
    catalog.colors.find((c) => c.id === state.colors.primaryId)?.name ?? "—"
  const secondaryColor = state.colors.secondaryEnabled
    ? catalog.colors.find((c) => c.id === state.colors.secondaryId)?.name
    : null
  const glitterName = state.glitter.enabled
    ? catalog.glitters.find((g) => g.id === state.glitter.glitterId)?.name
    : null
  const tasselColor = state.glitter.enabled
    ? catalog.tasselColors.find((t) => t.id === state.glitter.tasselColorId)?.name
    : null
  const extras = state.extras
    .map((id) => catalog.extras.find((e) => e.id === id)?.name)
    .filter(Boolean) as string[]
  const packagingName =
    state.packaging.type === "gift"
      ? catalog.packagingOptions.find((p) => p.id === state.packaging.optionId)?.name ?? "Para presente"
      : "Embalagem padrão"
  const shippingName =
    catalog.shippingOptions.find((s) => s.id === state.delivery.shippingOptionId)?.name ?? "—"

  const checklist = [
    {
      label: "Nome escrito corretamente",
      ok: !state.personalization.enabled || !!state.personalization.name,
    },
    { label: "Cores e detalhes escolhidos", ok: !!state.colors.primaryId },
    { label: "Tipo de entrega", ok: !!state.delivery.type },
    { label: "Embalagem para presente", ok: true },
    { label: "Valor total", ok: pricing.total > 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Hero celebrativo */}
      <section className="rounded-[var(--radius-xl)] border border-border bg-gradient-to-br from-primary/5 via-card to-card px-4 py-4 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">
          Sua peça está ganhando forma
          <Sparkles className="ml-1.5 inline h-4 w-4 text-primary" />
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Confira cada detalhe do seu pedido
        </p>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {TRUST_ITEMS.map((item) => (
            <div key={item.strong} className="flex flex-col items-center gap-1.5 rounded-[var(--radius-lg)] bg-card/60 py-2 px-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <item.icon className="h-4 w-4 text-primary" />
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                {item.label}
                <br />
                <span className="font-semibold text-foreground">{item.strong}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Visualização ilustrativa */}
        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5 lg:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Visualização da sua peça <span className="font-normal text-muted-foreground">(ilustrativa)</span>
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-[160px_1fr]">
            <div className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-muted/50">
              {productImage ? (
                <Image
                  src={productImage}
                  alt={productName}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-16 w-16 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <dl className="space-y-1.5 text-sm">
              <FichaRow label="Modelo" value={productName} />
              <FichaRow label="Cor" value={primaryColor} />
              {secondaryColor && <FichaRow label="2ª cor" value={secondaryColor} />}
              {glitterName && <FichaRow label="Glitter" value={glitterName} />}
              {tasselColor && <FichaRow label="Tassel" value={tasselColor} />}
              {state.personalization.enabled && state.personalization.name && (
                <FichaRow label="Nome" value={state.personalization.name} />
              )}
              {extras.length > 0 && <FichaRow label="Adicionais" value={extras.join(", ")} />}
              <FichaRow label="Embalagem" value={packagingName} />
            </dl>
          </div>
          <p className="mt-3 text-[10px] italic text-muted-foreground">
            *Imagem ilustrativa. Pode haver pequenas variações.
          </p>
        </section>

        {/* Prazo de entrega timeline */}
        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Prazo de entrega estimado
          </h3>
          <ol className="mt-4 space-y-3">
            <TimelineStep
              icon={Package}
              title="Produção"
              detail={`${deadlines.productionMin} a ${deadlines.productionMax} dias úteis`}
            />
            <TimelineStep
              icon={Truck}
              title={`Envio${shippingName !== "—" ? ` (${shippingName})` : ""}`}
              detail={
                state.delivery.type === "pickup"
                  ? "Retirada local"
                  : state.delivery.type === "transportadora"
                  ? "A combinar"
                  : `${deadlines.shippingMin} a ${deadlines.shippingMax} dias úteis`
              }
            />
            <TimelineStep
              icon={Calendar}
              title="Entrega estimada"
              detail={`Até ${deadlines.deliveryLabel}`}
              highlight
            />
          </ol>
        </section>
      </div>

      {/* Confira antes de finalizar */}
      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
          Confira antes de finalizar
        </h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {checklist.map((c) => (
            <li key={c.label} className="flex items-center gap-2 text-sm">
              <span
                className={
                  c.ok
                    ? "flex h-5 w-5 items-center justify-center rounded-full bg-success/15 text-success"
                    : "flex h-5 w-5 items-center justify-center rounded-full bg-warning/20 text-warning"
                }
              >
                <Check className="h-3 w-3" />
              </span>
              <span className="text-foreground">{c.label}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{formatBRL(pricing.total)}</span> · Entrada (50%):{" "}
          <span className="font-semibold text-primary">{formatBRL(pricing.deposit)}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Após a confirmação, seu pedido seguirá para produção.
        </p>
      </section>
    </div>
  )
}

function FichaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/50 py-1 last:border-0">
      <dt className="text-muted-foreground">{label}:</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  )
}

function TimelineStep({
  icon: Icon,
  title,
  detail,
  highlight,
}: {
  icon: React.ElementType
  title: string
  detail: string
  highlight?: boolean
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={
          highlight
            ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
            : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        }
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </li>
  )
}
