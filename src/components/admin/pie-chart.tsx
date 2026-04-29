import { cn } from "@/lib/utils"

interface PieSlice {
  label: string
  value: number
  color: string
}

interface PieChartProps {
  data: PieSlice[]
  className?: string
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(radians),
    y: cy + r * Math.sin(radians),
  }
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const startPoint = polarToCartesian(cx, cy, r, end)
  const endPoint = polarToCartesian(cx, cy, r, start)
  const largeArcFlag = end - start <= 180 ? "0" : "1"

  return [
    `M ${cx} ${cy}`,
    `L ${startPoint.x} ${startPoint.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${endPoint.x} ${endPoint.y}`,
    "Z",
  ].join(" ")
}

export function PieChart({ data, className }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const slices = data.reduce<Array<PieSlice & { start: number; end: number }>>(
    (acc, item) => {
      const start = acc.at(-1)?.end ?? 0
      const end = start + (item.value / total) * 360
      acc.push({ ...item, start, end })
      return acc
    },
    []
  )

  return (
    <div className={cn("grid gap-5 sm:grid-cols-[170px_1fr] sm:items-center", className)}>
      <svg viewBox="0 0 160 160" className="mx-auto h-40 w-40">
        <circle cx="80" cy="80" r="72" className="fill-muted" />
        {slices.map((item) => (
          <path
            key={item.label}
            d={describeArc(80, 80, 72, item.start, item.end)}
            fill={item.color}
            stroke="var(--card)"
            strokeWidth="3"
          />
        ))}
        <circle cx="80" cy="80" r="42" className="fill-card" />
        <text
          x="80"
          y="76"
          textAnchor="middle"
          className="fill-foreground text-[18px] font-bold"
        >
          {total}
        </text>
        <text
          x="80"
          y="94"
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          pedidos
        </text>
      </svg>

      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="font-semibold text-foreground">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
