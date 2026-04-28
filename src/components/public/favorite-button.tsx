"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { getFavorites, toggleFavorite } from "@/app/(public)/favoritos/favorites-grid"

interface Props {
  productId: string
  className?: string
}

export function FavoriteButton({ productId, className }: Props) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    setIsFavorite(getFavorites().includes(productId))

    function onUpdate() {
      setIsFavorite(getFavorites().includes(productId))
    }
    window.addEventListener("favorites-changed", onUpdate)
    return () => window.removeEventListener("favorites-changed", onUpdate)
  }, [productId])

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(productId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-white",
        className
      )}
      title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
        )}
      />
    </button>
  )
}
