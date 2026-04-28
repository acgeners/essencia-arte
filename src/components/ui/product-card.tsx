import Image from "next/image"
import { cn } from "@/lib/utils"
import { PriceDisplay } from "@/components/ui/price-display"

interface ProductCardProps {
  name: string
  price: number
  imageSrc?: string | null
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export function ProductCard({
  name,
  price,
  imageSrc,
  selected = false,
  disabled = false,
  onClick,
  className,
}: ProductCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col items-center gap-3 rounded-[var(--radius-xl)] border-2 bg-card p-4 text-center transition-all duration-200",
        selected
          ? "border-primary shadow-card ring-2 ring-primary/20"
          : "border-transparent shadow-soft hover:-translate-y-0.5 hover:border-border hover:shadow-card",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* Selected indicator */}
      {selected && (
        <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Image */}
      <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-muted sm:h-28 sm:w-28">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 96px, 112px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground">
            ✨
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-foreground">{name}</h3>

      {/* Price */}
      <PriceDisplay
        value={price}
        size="sm"
        className="text-primary"
      />
    </button>
  )
}
