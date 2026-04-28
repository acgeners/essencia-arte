"use client"

import { useWizardStore } from "@/stores/wizard-store"
import { DEFAULT_NAME_CHAR_LIMIT } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

export function StepPersonalization() {
  const { personalization, setPersonalization } = useWizardStore()
  // TODO: Buscar do Supabase ou configurações
  const personalizationPrice = 2.0

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-foreground">
        Personalização
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Deseja personalizar com nome? (+R$ {personalizationPrice.toFixed(2).replace(".", ",")})
      </p>

      {/* Toggle */}
      <div className="mt-6 flex gap-3">
        {[
          { value: true, label: `Sim +R$ ${personalizationPrice.toFixed(2).replace(".", ",")}` },
          { value: false, label: "Não R$ 0,00" },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() =>
              setPersonalization({
                enabled: opt.value,
                name: opt.value ? personalization.name : "",
              })
            }
            className={cn(
              "flex-1 rounded-[var(--radius-lg)] border-2 px-4 py-3 text-sm font-medium transition-all duration-200",
              personalization.enabled === opt.value
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Name input */}
      {personalization.enabled && (
        <div className="mt-6 space-y-3">
          <label
            htmlFor="custom-name"
            className="block text-sm font-medium text-foreground"
          >
            Escreva o nome desejado
          </label>
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

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-[var(--radius-md)] bg-warning/10 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs text-warning">
              <strong>Atenção:</strong> confira a escrita. Será produzida
              exatamente como digitada.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
