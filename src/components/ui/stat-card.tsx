import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-border bg-card p-6 shadow-soft transition-shadow duration-200 hover:shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend.value >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              <span className="text-muted-foreground">{trend.label}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
    </div>
  )
}
