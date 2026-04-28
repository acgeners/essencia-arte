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
}

interface WizardActions {
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
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
    address: null,
  },
  idempotencyKey: generateIdempotencyKey(),
}

export const useWizardStore = create<WizardState & WizardActions>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 7) })),
      prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),

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

      reset: () => set({ ...initialState, idempotencyKey: generateIdempotencyKey() }),
    }),
    {
      name: "essencia-arte-wizard",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
