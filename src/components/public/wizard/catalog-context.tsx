"use client"

import { createContext, useContext } from "react"
import type { FullCatalog } from "@/server/queries/catalog"

const CatalogContext = createContext<FullCatalog | null>(null)

export function CatalogProvider({
  catalog,
  children,
}: {
  catalog: FullCatalog
  children: React.ReactNode
}) {
  return (
    <CatalogContext.Provider value={catalog}>
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog(): FullCatalog {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error("useCatalog deve ser usado dentro de CatalogProvider")
  return ctx
}
