import type { Metadata } from "next"
import { Heart } from "lucide-react"
import { getFullCatalog } from "@/server/queries/catalog"
import { FavoritesGrid } from "./favorites-grid"

export const metadata: Metadata = {
  title: "Favoritos | Essência & Arte",
  description: "Seus produtos favoritos da Essência & Arte.",
}

export default async function FavoritosPage() {
  const catalog = await getFullCatalog()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Favoritos</h1>
            <p className="text-sm text-muted-foreground">Produtos que você salvou</p>
          </div>
        </div>

        <FavoritesGrid products={catalog.products} />

      </div>
    </div>
  )
}
