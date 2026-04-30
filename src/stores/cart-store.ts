"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { WizardState } from "@/stores/wizard-store"
import { generateIdempotencyKey } from "@/lib/utils"

export type CartView = "items" | "checkout" | "payment"

export interface CartItem {
  id: string
  wizardState: WizardState
  displayName: string
  categoryName: string
  imageSrc?: string | null
  totalPrice: number
  depositAmount: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  view: CartView
}

interface CartActions {
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  clearCart: () => void
  openCart: () => void
  openCartAt: (view: CartView) => void
  closeCart: () => void
  setView: (view: CartView) => void
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      view: "items",

      addItem: (item) =>
        set((s) => ({
          items: [...s.items, { ...item, id: generateIdempotencyKey() }],
        })),

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true, view: "items" }),
      openCartAt: (view) => set({ isOpen: true, view }),
      closeCart: () => set({ isOpen: false }),
      setView: (view) => set({ view }),
    }),
    {
      name: "essencia-arte-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
