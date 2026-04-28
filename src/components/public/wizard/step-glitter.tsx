"use client"

import { useWizardStore } from "@/stores/wizard-store"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { ColorSwatchGroup } from "@/components/ui/color-swatch"
import { cn } from "@/lib/utils"

export function StepGlitter() {
  const { glitter, setGlitter, productId } = useWizardStore()
  const catalog = useCatalog()

  const availableGlitters = catalog.glitters.filter(g => 
    g.allowedProducts.length === 0 || (productId && g.allowedProducts.includes(productId))
  )

  const availableTassels = catalog.tasselColors.filter(t => 
    t.allowedProducts.length === 0 || (productId && t.allowedProducts.includes(productId))
  )

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-foreground">
        Glitter & Efeitos
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Dê um toque de brilho (opcional)
      </p>

      {/* Toggle */}
      <div className="mt-6 flex gap-3">
        {[
          { value: true, label: "Sim" },
          { value: false, label: "Não" },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() =>
              setGlitter({
                enabled: opt.value,
                glitterId: opt.value ? glitter.glitterId : null,
                tasselColorId: opt.value ? glitter.tasselColorId : null,
              })
            }
            className={cn(
              "flex-1 rounded-[var(--radius-lg)] border-2 px-4 py-3 text-sm font-medium transition-all duration-200",
              glitter.enabled === opt.value
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {glitter.enabled && (
        <>
          {/* Glitter selection */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-foreground">
              Escolha o glitter
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {availableGlitters.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGlitter({ glitterId: g.id })}
                  className={cn(
                    "rounded-[var(--radius-lg)] border-2 px-4 py-3 text-sm font-medium transition-all duration-200",
                    glitter.glitterId === g.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  ✨ {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tassel color */}
          <div className="mt-6">
            <p className="mb-3 text-sm font-medium text-foreground">
              Cor do tassel
            </p>
            <ColorSwatchGroup
              colors={availableTassels}
              selectedId={glitter.tasselColorId}
              onSelect={(id) => setGlitter({ tasselColorId: id })}
              size="md"
            />
          </div>
        </>
      )}
    </div>
  )
}
