"use client"

import { useWizardStore } from "@/stores/wizard-store"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { cn } from "@/lib/utils"
import { Gift, ShoppingBag } from "lucide-react"

export function StepPackaging() {
  const { packaging, setPackaging, productId } = useWizardStore()
  const catalog = useCatalog()

  const availablePackaging = catalog.packagingOptions.filter(p => 
    p.allowedProducts.length === 0 || (productId && p.allowedProducts.includes(productId))
  )

  // Encontra a embalagem padrão (sem custo)
  const defaultPackaging = availablePackaging.find(p => p.price === 0)
  const defaultPkgId = defaultPackaging?.id ?? ""

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-foreground">
        Embalagem
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        O pedido é para presente?
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <button type="button" onClick={() => setPackaging({ type: "self", optionId: defaultPkgId })}
          className={cn("flex flex-col items-center gap-3 rounded-[--radius-xl] border-2 p-6 transition-all duration-200",
            packaging.type === "self" ? "border-primary bg-primary/5 shadow-card" : "border-border hover:border-primary/30")}>
          <ShoppingBag className={cn("h-8 w-8", packaging.type === "self" ? "text-primary" : "text-muted-foreground")} />
          <span className="text-sm font-semibold text-foreground">Para mim</span>
        </button>
        <button type="button" onClick={() => setPackaging({ type: "gift", optionId: null })}
          className={cn("flex flex-col items-center gap-3 rounded-[--radius-xl] border-2 p-6 transition-all duration-200",
            packaging.type === "gift" ? "border-primary bg-primary/5 shadow-card" : "border-border hover:border-primary/30")}>
          <Gift className={cn("h-8 w-8", packaging.type === "gift" ? "text-primary" : "text-muted-foreground")} />
          <span className="text-sm font-semibold text-foreground">Para presente</span>
        </button>
      </div>

      {packaging.type === "gift" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-medium text-foreground">Tipo de embalagem</p>
          <div className="space-y-3">
            {availablePackaging.map((opt) => (
              <button key={opt.id} type="button" onClick={() => setPackaging({ optionId: opt.id })}
                className={cn("flex w-full items-center justify-between rounded-[--radius-lg] border-2 px-5 py-4 text-left transition-all duration-200",
                  packaging.optionId === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                <span className="text-sm font-medium text-foreground">{opt.name}</span>
                <span className="text-sm font-semibold text-primary">
                  {(opt.price ?? 0) > 0 ? `+ R$ ${(opt.price ?? 0).toFixed(2).replace(".", ",")}` : "Incluso"}
                </span>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label htmlFor="gift-message" className="block text-sm font-medium text-foreground">
              Mensagem para o presente (opcional)
            </label>
            <textarea id="gift-message" value={packaging.message}
              onChange={(e) => setPackaging({ message: e.target.value })}
              placeholder="Escreva uma mensagem carinhosa..." rows={3}
              className="flex w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
        </div>
      )}
    </div>
  )
}
