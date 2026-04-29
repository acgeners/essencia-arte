"use client"

import { useEffect, useLayoutEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useWizardStore } from "@/stores/wizard-store"
import { useCartStore } from "@/stores/cart-store"
import { CatalogProvider } from "@/components/public/wizard/catalog-context"
import { Stepper } from "@/components/ui/stepper"
import { OrderSummaryPanel } from "@/components/public/wizard/order-summary-panel"
import { StepProduct } from "@/components/public/wizard/step-product"
import { StepModel } from "@/components/public/wizard/step-model"
import { StepCustomization } from "@/components/public/wizard/step-customization"
import { StepDelivery } from "@/components/public/wizard/step-delivery"
import { StepReview } from "@/components/public/wizard/step-review"
import { calculatePrice } from "@/lib/pricing/calculate"
import { estimateDeadlines } from "@/lib/pricing/deadlines"
import type { FullCatalog } from "@/server/queries/catalog"
import { ArrowLeft, ShoppingBag, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { label: "Produto" },
  { label: "Modelo" },
  { label: "Personalização" },
  { label: "Entrega" },
  { label: "Resumo" },
]

const STEP_COMPONENTS = [
  StepProduct,
  StepModel,
  StepCustomization,
  StepDelivery,
  StepReview,
]

function canProceed(state: ReturnType<typeof useWizardStore.getState>, step: number): boolean {
  switch (step) {
    case 0: return !!state.categorySlug
    case 1: return !!state.productId
    case 2: return !!state.colors.primaryId
    case 3:
      if (!state.delivery.type) return false
      if (state.delivery.type === "correios") {
        return !!state.delivery.shippingOptionId && !!state.delivery.shippingQuote
      }
      return true
    case 4: return true
    default: return false
  }
}

export function WizardShell({ catalog }: { catalog: FullCatalog }) {
  const searchParams = useSearchParams()
  const state = useWizardStore()
  const cartStore = useCartStore()
  const {
    step,
    nextStep,
    prevStep,
    startGeneric,
    startCategory,
    startProduct,
    setStep,
    reset,
  } = state
  const requestedProductId = searchParams.get("product")
  const requestedCategorySlug = searchParams.get("category")
  const isGenericEntry = !requestedProductId && !requestedCategorySlug
  const requestedProduct = requestedProductId
    ? catalog.products.find((item) => item.id === requestedProductId)
    : null
  const requestedCategory = requestedCategorySlug
    ? catalog.categories.find((item) => item.slug === requestedCategorySlug)
    : null

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [requestedProductId, requestedCategorySlug])

  useLayoutEffect(() => {
    if (!state.hasHydrated) return

    if (requestedProduct) {
      if (state.productId === requestedProduct.id && state.step >= 2) return
      startProduct(requestedProduct.categorySlug, requestedProduct.id)
      return
    }

    if (requestedCategory) {
      const isCurrentCategoryOnly =
        state.categorySlug === requestedCategory.slug && !state.productId && state.step === 1
      if (isCurrentCategoryOnly) return

      startCategory(requestedCategory.slug)
      return
    }

    if (isGenericEntry) {
      const isAlreadyGenericStart =
        state.step === 0 &&
        state.categorySlug === null &&
        state.productId === null
      if (!isAlreadyGenericStart) {
        startGeneric()
      }
    }
  }, [
    isGenericEntry,
    requestedCategory,
    requestedProduct,
    startGeneric,
    startCategory,
    startProduct,
    state.categorySlug,
    state.hasHydrated,
    state.productId,
    state.step,
  ])

  const pricing = calculatePrice(state, catalog)
  const deadlines = estimateDeadlines(state, catalog)
  const summaryDeadlines = {
    productionLabel: deadlines.productionLabel,
    deliveryLabel: deadlines.deliveryLabel,
  }
  const StepComponent = STEP_COMPONENTS[step]
  const isLastStep = step === STEPS.length - 1
  const isFirstStep = step === 0
  const ok = canProceed(state, step)
  const isPreparingEntry = !state.hasHydrated

  function handleAddToCart() {
    const product = catalog.products.find((p) => p.id === state.productId)
    const category = catalog.categories.find((c) => c.slug === state.categorySlug)
    const displayName = product
      ? category ? `${category.name} – ${product.name}` : product.name
      : "Produto personalizado"

    cartStore.addItem({
      wizardState: { ...state },
      displayName,
      categoryName: category?.name ?? "",
      totalPrice: pricing.total,
      depositAmount: pricing.deposit,
    })
    reset()
    cartStore.openCart()
  }

  function handleNext() {
    if (isLastStep) {
      handleAddToCart()
    } else {
      nextStep()
    }
  }

  return (
    <CatalogProvider catalog={catalog}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {isPreparingEntry ? (
          <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
            <div className="h-8 w-56 animate-pulse rounded-[var(--radius-md)] bg-muted" />
            <div className="mt-4 h-40 animate-pulse rounded-[var(--radius-lg)] bg-muted" />
          </div>
        ) : (
          <>
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
                {isLastStep ? (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    Adicionar à sacola
                  </>
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>

            {/* Mobile: price summary below navigation */}
            {!isLastStep && (
              <div className="mt-6 lg:hidden">
                <OrderSummaryPanel pricing={pricing} deadlines={summaryDeadlines} />
              </div>
            )}
          </div>

          {/* Desktop: sticky sidebar */}
          {!isLastStep && (
            <div className="hidden w-80 shrink-0 lg:block">
              <div className="sticky top-24">
                <OrderSummaryPanel pricing={pricing} deadlines={summaryDeadlines} />
              </div>
            </div>
          )}

        </div>
          </>
        )}
      </div>
    </CatalogProvider>
  )
}
