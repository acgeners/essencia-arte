"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { generateIdempotencyKey } from "@/lib/utils"

export interface WizardState {
  step: number
  categorySlug: string | null
  productId: string | null
  modelId: string | null
  personalization: {
    enabled: boolean
    name: string
  }
  colors: {
    primaryId: string | null
    secondaryEnabled: boolean
    secondaryId: string | null
  }
  glitter: {
    enabled: boolean
    glitterId: string | null
    tasselColorId: string | null
  }
  extras: string[]
  packaging: {
    type: "self" | "gift"
    optionId: string | null
    message: string
  }
  delivery: {
    type: "pickup" | "correios" | "transportadora" | null
    shippingOptionId: string | null
    cep: string
    shippingQuote: {
      optionId: string
      name: string
      price: number
      minDays: number
      maxDays: number
    } | null
    address: {
      street: string
      number: string
      complement: string
      district: string
      city: string
      state: string
    } | null
  }
  idempotencyKey: string
  productDrafts: Record<string, WizardDraft>
  hasHydrated: boolean
}

interface WizardActions {
  setHasHydrated: (hasHydrated: boolean) => void
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  startGeneric: () => void
  startCategory: (slug: string) => void
  startProduct: (categorySlug: string, productId: string) => void
  setCategorySlug: (slug: string) => void
  setProductId: (id: string) => void
  setModelId: (id: string) => void
  setPersonalization: (data: Partial<WizardState["personalization"]>) => void
  setColors: (data: Partial<WizardState["colors"]>) => void
  setGlitter: (data: Partial<WizardState["glitter"]>) => void
  toggleExtra: (id: string) => void
  setPackaging: (data: Partial<WizardState["packaging"]>) => void
  setDelivery: (data: Partial<WizardState["delivery"]>) => void
  reset: () => void
}

type WizardDraft = Omit<WizardState, "productDrafts" | "hasHydrated">

const initialState: WizardState = {
  step: 0,
  categorySlug: null,
  productId: null,
  modelId: null,
  personalization: {
    enabled: false,
    name: "",
  },
  colors: {
    primaryId: null,
    secondaryEnabled: false,
    secondaryId: null,
  },
  glitter: {
    enabled: false,
    glitterId: null,
    tasselColorId: null,
  },
  extras: [],
  packaging: {
    type: "self",
    optionId: null,
    message: "",
  },
  delivery: {
    type: null,
    shippingOptionId: null,
    cep: "",
    shippingQuote: null,
    address: null,
  },
  idempotencyKey: generateIdempotencyKey(),
  productDrafts: {},
  hasHydrated: false,
}

function saveCurrentDraft(state: WizardState): Record<string, WizardDraft> {
  const currentDrafts = state.productDrafts ?? {}
  if (!state.productId || state.step <= 0) return currentDrafts

  const {
    productDrafts: _productDrafts,
    hasHydrated: _hasHydrated,
    ...draft
  } = state
  void _productDrafts
  void _hasHydrated
  return {
    ...currentDrafts,
    [state.productId]: draft,
  }
}

export const useWizardStore = create<WizardState & WizardActions>()(
  persist(
    (set) => ({
      ...initialState,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      setStep: (step) => set({ step }),
      nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 4) })),
      prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),

      startGeneric: () =>
        set((s) => {
          const productDrafts = saveCurrentDraft(s)
          return {
            ...initialState,
            productDrafts,
            hasHydrated: s.hasHydrated,
            idempotencyKey: generateIdempotencyKey(),
          }
        }),

      startCategory: (slug) =>
        set((s) => {
          const productDrafts = saveCurrentDraft(s)
          return {
            ...initialState,
            productDrafts,
            hasHydrated: s.hasHydrated,
            idempotencyKey: generateIdempotencyKey(),
            categorySlug: slug,
            step: 1,
          }
        }),

      startProduct: (categorySlug, productId) =>
        set((s) => {
          const productDrafts = saveCurrentDraft(s)
          const draft = productDrafts[productId]

          if (draft && draft.step >= 2) {
            return {
              ...draft,
              step: Math.min(draft.step, 4),
              productDrafts,
              hasHydrated: s.hasHydrated,
            }
          }

          return {
            ...initialState,
            productDrafts,
            hasHydrated: s.hasHydrated,
            idempotencyKey: generateIdempotencyKey(),
            categorySlug,
            productId,
            step: 2,
          }
        }),

      setCategorySlug: (slug) =>
        set({ categorySlug: slug, productId: null, modelId: null }),

      setProductId: (id) => set({ productId: id, modelId: null }),

      setModelId: (id) => set({ modelId: id }),

      setPersonalization: (data) =>
        set((s) => ({ personalization: { ...s.personalization, ...data } })),

      setColors: (data) =>
        set((s) => ({ colors: { ...s.colors, ...data } })),

      setGlitter: (data) =>
        set((s) => ({ glitter: { ...s.glitter, ...data } })),

      toggleExtra: (id) =>
        set((s) => ({
          extras: s.extras.includes(id)
            ? s.extras.filter((e) => e !== id)
            : [...s.extras, id],
        })),

      setPackaging: (data) =>
        set((s) => ({ packaging: { ...s.packaging, ...data } })),

      setDelivery: (data) =>
        set((s) => ({ delivery: { ...s.delivery, ...data } })),

      reset: () =>
        set((s) => ({
          ...initialState,
          hasHydrated: s.hasHydrated,
          idempotencyKey: generateIdempotencyKey(),
        })),
    }),
    {
      name: "essencia-arte-wizard",
      version: 2,
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ hasHydrated: _hasHydrated, ...state }) => {
        void _hasHydrated
        return state
      },
      migrate: (_persisted, version) => {
        if (version < 2) {
          return {
            ...initialState,
            idempotencyKey: generateIdempotencyKey(),
          } as WizardState & WizardActions
        }
        return _persisted as WizardState & WizardActions
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.step = Math.min(state.step ?? 0, 4)
          const cleanDrafts: Record<string, WizardDraft> = {}
          for (const [id, draft] of Object.entries(state.productDrafts ?? {})) {
            cleanDrafts[id] = { ...draft, step: Math.min(draft.step, 4) }
          }
          state.productDrafts = cleanDrafts
          state.setHasHydrated(true)
        }
      },
    }
  )
)
