"use client"

import { useWizardStore } from "@/stores/wizard-store"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { ColorSwatchGroup } from "@/components/ui/color-swatch"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"
import { DEFAULT_NAME_CHAR_LIMIT } from "@/lib/constants"
import { AlertTriangle } from "lucide-react"

export function StepCustomization() {
  const { colors, setColors, glitter, setGlitter, personalization, setPersonalization, extras, toggleExtra, productId } = useWizardStore()
  const catalog = useCatalog()

  const availableColors = catalog.colors.filter(c =>
    c.allowedProducts.length === 0 || (productId && c.allowedProducts.includes(productId))
  )
  const availableGlitters = catalog.glitters.filter(g =>
    g.allowedProducts.length === 0 || (productId && g.allowedProducts.includes(productId))
  )
  const availableTassels = catalog.tasselColors.filter(t =>
    t.allowedProducts.length === 0 || (productId && t.allowedProducts.includes(productId))
  )
  const availableExtras = catalog.extras.filter(e =>
    e.allowedProducts.length === 0 || (productId && e.allowedProducts.includes(productId))
  )

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">Personalização</h2>
        <p className="mt-1 text-sm text-muted-foreground">Configure as cores e detalhes da sua peça</p>
      </div>

      {/* ── Cores ── */}
      <section>
        <p className="mb-3 text-sm font-semibold text-foreground">Cor principal <span className="text-destructive">*</span></p>
        <ColorSwatchGroup
          colors={availableColors}
          selectedId={colors.primaryId}
          onSelect={(id) => setColors({ primaryId: id })}
          size="lg"
        />

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-foreground">Deseja 2 cores?</p>
          <div className="flex gap-3">
            {([{ value: true, label: "Sim" }, { value: false, label: "Não" }] as const).map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setColors({ secondaryEnabled: opt.value, secondaryId: opt.value ? colors.secondaryId : null })}
                className={cn(
                  "rounded-[var(--radius-lg)] border-2 px-6 py-2.5 text-sm font-medium transition-all",
                  colors.secondaryEnabled === opt.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {colors.secondaryEnabled && (
            <div className="mt-4">
              <p className="mb-3 text-sm font-medium text-foreground">Cor secundária</p>
              <ColorSwatchGroup
                colors={availableColors.filter(c => c.id !== colors.primaryId)}
                selectedId={colors.secondaryId}
                onSelect={(id) => setColors({ secondaryId: id })}
                size="lg"
              />
            </div>
          )}
        </div>
      </section>

      <div className="border-t border-border" />

      {/* ── Glitter (opcional) ── */}
      {availableGlitters.length > 0 && (
        <section>
          <ToggleSection
            label="Glitter & Efeitos"
            description="Dê um toque de brilho (opcional)"
            enabled={glitter.enabled}
            onToggle={(v) => setGlitter({ enabled: v, glitterId: v ? glitter.glitterId : null, tasselColorId: v ? glitter.tasselColorId : null })}
          >
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {availableGlitters.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGlitter({ glitterId: g.id })}
                  className={cn(
                    "rounded-[var(--radius-lg)] border-2 px-4 py-3 text-sm font-medium transition-all",
                    glitter.glitterId === g.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  ✨ {g.name}
                </button>
              ))}
            </div>
            {availableTassels.length > 0 && (
              <div className="mt-4">
                <p className="mb-3 text-sm font-medium text-foreground">Cor do tassel</p>
                <ColorSwatchGroup
                  colors={availableTassels}
                  selectedId={glitter.tasselColorId}
                  onSelect={(id) => setGlitter({ tasselColorId: id })}
                  size="md"
                />
              </div>
            )}
          </ToggleSection>
        </section>
      )}

      <div className="border-t border-border" />

      {/* ── Nome personalizado (opcional) ── */}
      <section>
        <ToggleSection
          label="Nome personalizado"
          description="+R$ 2,00 — escreva o nome desejado"
          enabled={personalization.enabled}
          onToggle={(v) => setPersonalization({ enabled: v, name: v ? personalization.name : "" })}
        >
          <div className="mt-4 space-y-3">
            <div className="relative">
              <input
                id="custom-name"
                type="text"
                value={personalization.name}
                onChange={(e) => {
                  if (e.target.value.length <= DEFAULT_NAME_CHAR_LIMIT) {
                    setPersonalization({ name: e.target.value })
                  }
                }}
                placeholder="Ex: Maria Eduarda"
                className="flex h-11 w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {personalization.name.length}/{DEFAULT_NAME_CHAR_LIMIT}
              </span>
            </div>
            <div className="flex items-start gap-2 rounded-[var(--radius-md)] bg-warning/10 px-3 py-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-xs text-warning">
                <strong>Atenção:</strong> confira a escrita. Será produzida exatamente como digitada.
              </p>
            </div>
          </div>
        </ToggleSection>
      </section>

      {availableExtras.length > 0 && (
        <>
          <div className="border-t border-border" />

          {/* ── Adicionais (opcional) ── */}
          <section>
            <ToggleSection
              label="Adicionais"
              description="Itens extras para complementar sua peça"
              enabled={extras.length > 0}
              onToggle={(v) => {
                if (!v) {
                  extras.forEach((id) => toggleExtra(id))
                }
              }}
            >
              <div className="mt-4 space-y-3">
                {availableExtras.map((extra) => {
                  const isSelected = extras.includes(extra.id)
                  const isDisabled = !extra.inStock
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => !isDisabled && toggleExtra(extra.id)}
                      disabled={isDisabled}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[var(--radius-lg)] border-2 px-5 py-4 text-left transition-all",
                        isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                        isDisabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all", isSelected ? "border-primary bg-primary" : "border-border")}>
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className={cn("text-sm font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
                          {extra.name}
                        </span>
                        {isDisabled && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                            Sem estoque
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        + R$ {extra.price.toFixed(2).replace(".", ",")}
                      </span>
                    </button>
                  )
                })}
              </div>
            </ToggleSection>
          </section>
        </>
      )}
    </div>
  )
}

function ToggleSection({
  label,
  description,
  enabled,
  onToggle,
  children,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn("text-xs font-medium", enabled ? "text-primary" : "text-muted-foreground")}>
            {enabled ? "Sim" : "Não"}
          </span>
          <div className={cn("flex h-6 w-11 items-center rounded-full transition-colors", enabled ? "bg-primary" : "bg-border")}>
            <div className={cn("h-5 w-5 rounded-full bg-white shadow transition-transform", enabled ? "translate-x-5" : "translate-x-0.5")} />
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", enabled && "rotate-180")} />
        </div>
      </button>

      {enabled && (
        <div className="mt-2 pl-1">{children}</div>
      )}
    </div>
  )
}
