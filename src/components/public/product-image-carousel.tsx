"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import { FavoriteButton } from "@/components/public/favorite-button"
import { useWizardStore } from "@/stores/wizard-store"

interface ProductImageCarouselProps {
  productId: string
  productName: string
  categorySlug: string
  images: string[] | null
}

export function ProductImageCarousel({
  productId,
  productName,
  categorySlug,
  images,
}: ProductImageCarouselProps) {
  const validImages = images?.filter(Boolean) ?? []
  const [index, setIndex] = useState(0)
  const isFirst = index === 0
  const isLast = index === validImages.length - 1
  const hasMultipleImages = validImages.length > 1

  const router = useRouter()
  const wizardStore = useWizardStore()

  function handleImageClick() {
    const isResuming = wizardStore.productId === productId && wizardStore.step > 0
    if (!isResuming) {
      wizardStore.reset()
      wizardStore.setCategorySlug(categorySlug)
      wizardStore.setProductId(productId)
    }
    router.push("/pedido/novo")
  }

  function handlePrevious(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    setIndex(index - 1)
  }

  function handleNext(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    setIndex(index + 1)
  }

  return (
    <div className="relative aspect-square">
      {/* Image container — overflow-hidden only here so arrows can overflow */}
      <div className="absolute inset-0 overflow-hidden rounded-[var(--radius-xl)] bg-muted">
        <button
          type="button"
          onClick={handleImageClick}
          className="absolute inset-0 z-0 h-full w-full"
          aria-label={`Personalizar ${productName}`}
        >
          {validImages.length > 0 ? (
            validImages.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={productName}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                className={cn(
                  "object-cover transition-opacity duration-300 group-hover:scale-105",
                  i === index ? "opacity-100" : "opacity-0"
                )}
                priority={i === 0}
              />
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/15" />
            </div>
          )}
        </button>

        {hasMultipleImages && (
          <>
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrevious}
                className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground opacity-0 shadow-md transition-all duration-200 hover:bg-white hover:shadow-lg focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
                aria-label={`Imagem anterior de ${productName}`}
              >
                <ChevronLeft className="h-4 w-4 translate-x-1" strokeWidth={2.5} />
              </button>
            )}
            {!isLast && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-0 top-1/2 z-10 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-foreground opacity-0 shadow-md transition-all duration-200 hover:bg-white hover:shadow-lg focus-visible:opacity-100 focus-visible:outline-none group-hover:opacity-100"
                aria-label={`Próxima imagem de ${productName}`}
              >
                <ChevronRight className="h-4 w-4 -translate-x-1" strokeWidth={2.5} />
              </button>
            )}
          </>
        )}

        {hasMultipleImages && (
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
        )}

        <FavoriteButton productId={productId} className="absolute right-2.5 top-2.5 z-20" />
      </div>
    </div>
  )
}
