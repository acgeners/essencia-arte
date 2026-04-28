import { cn } from "@/lib/utils"
import { ORDER_STATUS, ORDER_STATUS_COLORS, type OrderStatus } from "@/lib/constants"

interface StatusBadgeProps {
  status: OrderStatus
  size?: "sm" | "md"
  className?: string
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
}

export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        ORDER_STATUS_COLORS[status],
        sizeClasses[size],
        className
      )}
    >
      {ORDER_STATUS[status]}
    </span>
  )
}
