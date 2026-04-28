"use client"

import { useRouter } from "next/navigation"
import { useWizardStore } from "@/stores/wizard-store"
import { CatalogProvider } from "@/components/public/wizard/catalog-context"
import { Stepper } from "@/components/ui/stepper"
import { OrderSummaryPanel } from "@/components/public/wizard/order-summary-panel"
import { StepProduct } from "@/components/public/wizard/step-product"
import { StepModel } from "@/components/public/wizard/step-model"
import { StepColors } from "@/components/public/wizard/step-colors"
import { StepGlitter } from "@/components/public/wizard/step-glitter"
import { StepPersonalization } from "@/components/public/wizard/step-personalization"
import { StepExtras } from "@/components/public/wizard/step-extras"
import { StepDelivery } from "@/components/public/wizard/step-delivery"
import { calculatePrice } from "@/lib/pricing/calculate"
import type { FullCatalog } from "@/server/queries/catalog"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { label: "Produto" },
  { label: "Modelo" },
  { label: "Cores" },
  { label: "Glitter" },
  { label: "Nome" },
  { label: "Adicionais" },
  { label: "Entrega" },
]

const STEP_COMPONENTS = [
  StepProduct,
  StepModel,
  StepColors,
  StepGlitter,
  StepPersonalization,
  StepExtras,
  StepDelivery,
]

function canProceed(state: ReturnType<typeof useWizardStore.getState>, step: number): boolean {
  switch (step) {
    case 0: return !!state.categorySlug
    case 1: return !!state.productId
    case 2: return !!state.colors.primaryId
    case 3: return true
    case 4: return true
    case 5: return true
    case 6:
      if (!state.delivery.type) return false
      if (state.delivery.type === "correios") return !!state.delivery.shippingOptionId
      return true
    default: return false
  }
}

export function WizardShell({ catalog }: { catalog: FullCatalog }) {
  const router = useRouter()
  const state = useWizardStore()
  const { step, nextStep, prevStep, setStep } = state

  const pricing = calculatePrice(state, catalog)
  const StepComponent = STEP_COMPONENTS[step]
  const isLastStep = step === STEPS.length - 1
  const isFirstStep = step === 0
  const ok = canProceed(state, step)

  function handleNext() {
    if (isLastStep) {
      router.push("/pedido/confirmacao/preview")
    } else {
      nextStep()
    }
  }

  return (
    <CatalogProvider catalog={catalog}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={step} className="mb-8" onStepClick={setStep} />

        {/* Layout: step + summary sidebar */}
        <div className="flex gap-6">

          {/* Step content */}
          <div className="min-w-0 flex-1">
            <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
              {StepComponent && <StepComponent />}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={isFirstStep}
                className={cn(
                  "flex items-center gap-2 rounded-[var(--radius-lg)] px-4 py-2.5 text-sm font-medium transition-colors",
                  isFirstStep
                    ? "invisible"
                    : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!ok}
                className={cn(
                  "flex items-center gap-2 rounded-[var(--radius-xl)] px-8 py-3 text-base font-semibold transition-all duration-200",
                  ok
                    ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/85 hover:shadow-lg active:scale-[0.98]"
                    : "cursor-not-allowed bg-muted text-muted-foreground"
                )}
              >
                {isLastStep ? "Finalizar pedido" : "Continuar"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile: price summary below navigation */}
            <div className="mt-6 lg:hidden">
              <OrderSummaryPanel pricing={pricing} />
            </div>
          </div>

          {/* Desktop: sticky sidebar */}
          <div className="hidden w-80 shrink-0 lg:block">
            <div className="sticky top-24">
              <OrderSummaryPanel pricing={pricing} />
            </div>
          </div>

        </div>
      </div>
    </CatalogProvider>
  )
}
