import { cn } from "@/lib/utils"
import { formatBRL } from "@/lib/format"

interface PriceDisplayProps {
  value: number
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showSign?: boolean
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl font-bold",
  xl: "text-3xl font-bold",
}

export function PriceDisplay({
  value,
  size = "md",
  className,
  showSign = false,
}: PriceDisplayProps) {
  const formatted = formatBRL(value)
  const prefix = showSign && value > 0 ? "+" : ""

  return (
    <span
      className={cn(sizeClasses[size], className)}
      aria-label={`${prefix}${formatted}`}
    >
      {prefix}
      {formatted}
    </span>
  )
}
