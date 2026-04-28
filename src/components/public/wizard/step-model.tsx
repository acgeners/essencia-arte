"use client"

import Image from "next/image"
import { Package } from "lucide-react"
import { useWizardStore } from "@/stores/wizard-store"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { cn } from "@/lib/utils"

export function StepModel() {
  const { productId, categorySlug, setProductId } = useWizardStore()
  const catalog = useCatalog()

  const products = categorySlug
    ? catalog.products.filter((p) => p.categorySlug === categorySlug)
    : catalog.products

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-foreground">
        Escolha o modelo
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Selecione o formato da sua peça
      </p>

      {products.length === 0 ? (
        <p className="mt-6 py-8 text-center text-sm text-muted-foreground">
          Nenhum produto encontrado. Volte e selecione uma categoria.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setProductId(product.id)}
              className={cn(
                "flex items-start gap-4 rounded-[var(--radius-xl)] border-2 p-5 text-left transition-all duration-200",
                productId === product.id
                  ? "border-primary bg-primary/5 shadow-card"
                  : "border-transparent bg-muted/50 hover:border-border hover:shadow-soft"
              )}
            >
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-primary/10">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <Package className="h-7 w-7 text-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-foreground">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-primary">
                  A partir de R$ {product.basePrice.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
