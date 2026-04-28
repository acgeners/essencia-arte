"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { WizardState } from "@/stores/wizard-store"
import { generateIdempotencyKey } from "@/lib/utils"

export interface CartItem {
  id: string
  wizardState: WizardState
  displayName: string
  categoryName: string
  totalPrice: number
  depositAmount: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
}

interface CartActions {
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((s) => ({
          items: [...s.items, { ...item, id: generateIdempotencyKey() }],
        })),

      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: "essencia-arte-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
