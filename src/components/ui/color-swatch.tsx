"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { getHexColor } from "@/lib/colors"

interface ColorSwatchProps {
  color: string
  name: string
  selected?: boolean
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  onClick?: () => void
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
}

export function ColorSwatch({
  color,
  name,
  selected = false,
  disabled = false,
  size = "md",
  onClick,
}: ColorSwatchProps) {
  // Determine if color is light to show dark check mark
  const isLight = isLightColor(color)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Cor: ${name}${selected ? " (selecionada)" : ""}`}
      aria-pressed={selected}
      className={cn(
        "relative rounded-full border-2 transition-all duration-200",
        sizeClasses[size],
        selected
          ? "border-primary ring-2 ring-primary/30 scale-110"
          : "border-transparent hover:border-border hover:scale-105",
        disabled && "cursor-not-allowed opacity-40"
      )}
      style={{ backgroundColor: color }}
    >
      {selected && (
        <Check
          className={cn(
            "absolute inset-0 m-auto h-4 w-4",
            isLight ? "text-foreground" : "text-white"
          )}
          strokeWidth={3}
        />
      )}
    </button>
  )
}

interface ColorSwatchGroupProps {
  colors: Array<{
    id: string
    name: string
  }>
  selectedId: string | null
  onSelect: (id: string) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ColorSwatchGroup({
  colors,
  selectedId,
  onSelect,
  disabled = false,
  size = "md",
  className,
}: ColorSwatchGroupProps) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="radiogroup"
      aria-label="Seleção de cor"
    >
      {colors.map((color) => (
        <div key={color.id} className="flex flex-col items-center gap-1">
          <ColorSwatch
            color={getHexColor(color.name)}
            name={color.name}
            selected={selectedId === color.id}
            disabled={disabled}
            size={size}
            onClick={() => onSelect(color.id)}
          />
          {size !== "sm" && (
            <span className="text-[10px] text-muted-foreground">
              {color.name}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Check if a hex color is light (for contrast calculation).
 */
function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "")
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6
}
