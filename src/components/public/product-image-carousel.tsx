"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import { FavoriteButton } from "@/components/public/favorite-button"

interface ProductImageCarouselProps {
  productId: string
  productName: string
  images: string[] | null
}

export function ProductImageCarousel({
  productId,
  productName,
  images,
}: ProductImageCarouselProps) {
  const validImages = images?.filter(Boolean) ?? []
  const [index, setIndex] = useState(0)
  const hasMultipleImages = validImages.length > 1
  const currentImage = validImages[index] ?? null

  function goToImage(nextIndex: number) {
    setIndex((nextIndex + validImages.length) % validImages.length)
  }

  function handlePrevious(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    goToImage(index - 1)
  }

  function handleNext(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    goToImage(index + 1)
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-muted">
      {currentImage ? (
        <Image
          src={currentImage}
          alt={productName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/15" />
        </div>
      )}

      {hasMultipleImages && (
        <>
          <button
            type="button"
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:bg-white"
            aria-label={`Imagem anterior de ${productName}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:bg-white"
            aria-label={`Próxima imagem de ${productName}`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2 py-1 backdrop-blur-sm">
            {validImages.map((image, imageIndex) => (
              <button
                key={`${image}-${imageIndex}`}
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setIndex(imageIndex)
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  imageIndex === index ? "w-4 bg-white" : "w-1.5 bg-white/60"
                )}
                aria-label={`Ver imagem ${imageIndex + 1} de ${productName}`}
              />
            ))}
          </div>
        </>
      )}

      <FavoriteButton productId={productId} className="absolute right-2.5 top-2.5 z-20" />
    </div>
  )
}
