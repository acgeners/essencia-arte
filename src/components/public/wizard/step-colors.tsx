"use client"

import { useWizardStore } from "@/stores/wizard-store"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { ColorSwatchGroup } from "@/components/ui/color-swatch"
import { cn } from "@/lib/utils"

export function StepColors() {
  const { colors, setColors, productId } = useWizardStore()
  const catalog = useCatalog()

  const availableColors = catalog.colors.filter(c => 
    c.allowedProducts.length === 0 || (productId && c.allowedProducts.includes(productId))
  )

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-foreground">
        Cores
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha a cor principal da sua peça
      </p>

      {/* Primary color */}
      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-foreground">
          Cor principal
        </p>
        <ColorSwatchGroup
          colors={availableColors}
          selectedId={colors.primaryId}
          onSelect={(id) => setColors({ primaryId: id })}
          size="lg"
        />
      </div>

      {/* Toggle 2 cores */}
      <div className="mt-8">
        <p className="mb-3 text-sm font-medium text-foreground">
          Deseja 2 cores?
        </p>
        <div className="flex gap-3">
          {[
            { value: true, label: "Sim" },
            { value: false, label: "Não" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() =>
                setColors({
                  secondaryEnabled: opt.value,
                  secondaryId: opt.value ? colors.secondaryId : null,
                })
              }
              className={cn(
                "rounded-[var(--radius-lg)] border-2 px-6 py-2.5 text-sm font-medium transition-all duration-200",
                colors.secondaryEnabled === opt.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary color */}
      {colors.secondaryEnabled && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-foreground">
            Cor secundária
          </p>
          <ColorSwatchGroup
            colors={availableColors.filter((c) => c.id !== colors.primaryId)}
            selectedId={colors.secondaryId}
            onSelect={(id) => setColors({ secondaryId: id })}
            size="lg"
          />
        </div>
      )}
    </div>
  )
}
