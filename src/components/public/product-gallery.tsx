"use client"

import { useState } from "react"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  productName: string
  images: string[] | null
}

export function ProductGallery({ productName, images }: Props) {
  const validImages: string[] = images?.filter((src): src is string => Boolean(src)) ?? []
  const [index, setIndex] = useState(0)

  const currentImage = validImages[index]

  if (validImages.length === 0 || !currentImage) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[var(--radius-xl)] bg-muted">
        <ShoppingBag className="h-20 w-20 text-muted-foreground/20" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-muted">
        <Image
          src={currentImage}
          alt={productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {validImages.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {validImages.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-[var(--radius-md)] bg-muted transition-all sm:h-20 sm:w-20",
                i === index
                  ? "ring-2 ring-primary ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              )}
              aria-label={`Ver imagem ${i + 1} de ${productName}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
