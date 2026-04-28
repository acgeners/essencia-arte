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
            className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary opacity-0 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-primary-hover focus-visible:translate-x-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 group-hover:translate-x-0 group-hover:opacity-100"
            aria-label={`Imagem anterior de ${productName}`}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1 top-1/2 z-10 flex h-9 w-9 translate-x-2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary opacity-0 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-primary-hover focus-visible:translate-x-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 group-hover:translate-x-0 group-hover:opacity-100"
            aria-label={`Próxima imagem de ${productName}`}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/20 px-2 py-1 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
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
