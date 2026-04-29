"use client"

import { useWizardStore } from "@/stores/wizard-store"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { ChevronRight, Pen, KeyRound, Gem, Gift, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const categoryIcons: Record<string, React.ElementType> = {
  canetas: Pen,
  chaveiros: KeyRound,
  "porta-aliancas": Gem,
  lembrancas: Gift,
  outros: Sparkles,
}

const categoryDesc: Record<string, string> = {
  canetas: "Personalizadas com glitter e nome",
  chaveiros: "Artesanais em resina colorida",
  "porta-aliancas": "Perfeitos para casamentos",
  lembrancas: "Kits e presentes especiais",
  outros: "Peças exclusivas e artesanais",
}

export function StepProduct() {
  const { categorySlug, setCategorySlug } = useWizardStore()
  const catalog = useCatalog()

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-foreground">
        O que você deseja personalizar hoje?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha a categoria do produto
      </p>

      <ul className="mt-6 space-y-2">
        {catalog.categories.map((cat) => {
          const Icon = categoryIcons[cat.slug] ?? Sparkles
          const isSelected = categorySlug === cat.slug

          return (
            <li key={cat.slug}>
              <button
                type="button"
                onClick={() => setCategorySlug(cat.slug)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-[var(--radius-lg)] border-2 px-4 py-3.5 text-left transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-card"
                    : "border-border bg-card hover:border-primary/30 hover:bg-muted/40"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors",
                    isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-semibold",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {cat.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {categoryDesc[cat.slug] ?? "Peças exclusivas artesanais"}
                  </span>
                </span>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
