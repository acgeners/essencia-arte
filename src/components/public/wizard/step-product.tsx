"use client"

import { useWizardStore } from "@/stores/wizard-store"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { Pen, KeyRound, Gem, Gift, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const categoryIcons: Record<string, React.ElementType> = {
  canetas: Pen,
  chaveiros: KeyRound,
  "porta-aliancas": Gem,
  lembrancas: Gift,
  outros: Sparkles,
}

export function StepProduct() {
  const { categorySlug, setCategorySlug } = useWizardStore()
  const catalog = useCatalog()

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-foreground">
        O que você quer personalizar?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha a categoria do produto
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {catalog.categories.map((cat) => {
          const Icon = categoryIcons[cat.slug] ?? Sparkles
          const isSelected = categorySlug === cat.slug

          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setCategorySlug(cat.slug)}
              className={cn(
                "flex flex-col items-center gap-3 rounded-[var(--radius-xl)] border-2 p-6 text-center transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary/5 shadow-card"
                  : "border-border bg-muted/30 hover:border-primary/30 hover:bg-card hover:shadow-soft"
              )}
            >
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] transition-colors",
                  isSelected ? "bg-primary/15" : "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "h-7 w-7",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {cat.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
