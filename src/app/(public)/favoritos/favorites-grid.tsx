"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatBRL } from "@/lib/format"

interface Product {
  id: string
  name: string
  basePrice: number
  images: string[] | null
  categorySlug: string | null
}

interface Props {
  products: Product[]
}

const STORAGE_KEY = "essencia-arte-favorites"

export function getFavorites(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
  } catch {
    return []
  }
}

export function toggleFavorite(id: string) {
  const favs = getFavorites()
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event("favorites-changed"))
}

export function FavoritesGrid({ products }: Props) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setFavorites(getFavorites())
    setMounted(true)

    function onUpdate() {
      setFavorites(getFavorites())
    }
    window.addEventListener("favorites-changed", onUpdate)
    return () => window.removeEventListener("favorites-changed", onUpdate)
  }, [])

  const favoriteProducts = products.filter((p) => favorites.includes(p.id))

  if (!mounted) return null

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Heart className="h-10 w-10 text-primary/40" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Nenhum favorito ainda
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Clique no ícone de coração nos produtos para salvá-los aqui e acessar rapidamente depois.
          </p>
        </div>
        <Link
          href="/pedido/novo"
          className="mt-2 rounded-[var(--radius-xl)] bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/85 hover:shadow-lg"
        >
          Ver produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {favoriteProducts.map((product) => (
        <div
          key={product.id}
          className="group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card shadow-soft transition-all hover:shadow-card"
        >
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
              </div>
            )}
            {/* Remove from favorites */}
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
              title="Remover dos favoritos"
            >
              <Heart className="h-4 w-4 fill-primary" />
            </button>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {product.categorySlug ?? "Produto"}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-foreground line-clamp-2">
                {product.name}
              </h3>
              <p className="mt-1 text-base font-bold text-foreground">
                {formatBRL(product.basePrice)}
              </p>
            </div>
            <Link
              href={`/pedido/novo`}
              className="flex h-9 w-full items-center justify-center rounded-[var(--radius-lg)] border-2 border-foreground bg-white text-[11px] font-black uppercase tracking-widest text-foreground transition-all hover:bg-foreground hover:text-white"
            >
              Personalizar
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
