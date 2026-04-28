"use client"

import { useWizardStore } from "@/stores/wizard-store"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export function StepExtras() {
  const { extras, toggleExtra, productId } = useWizardStore()
  const catalog = useCatalog()

  const availableExtras = catalog.extras.filter(e => 
    e.allowedProducts.length === 0 || (productId && e.allowedProducts.includes(productId))
  )

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-foreground">
        Adicionais
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha os adicionais desejados (opcionais)
      </p>

      <div className="mt-6 space-y-3">
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
                "flex w-full items-center justify-between rounded-[var(--radius-lg)] border-2 px-5 py-4 text-left transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30",
                isDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-border"
                  )}
                >
                  {isSelected && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}
                >
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
    </div>
  )
}
