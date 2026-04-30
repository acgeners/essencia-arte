"use client"

import { formatBRL } from "@/lib/format"

interface Point {
  date: string
  value: number
}

export function RevenueChart({ data }: { data: Point[] }) {
  if (data.length === 0) return null

  const W = 640
  const H = 200
  const PADX = 40
  const PADY = 20
  const max = Math.max(...data.map((d) => d.value)) * 1.15
  const min = 0

  const x = (i: number) => PADX + (i * (W - PADX * 2)) / (data.length - 1)
  const y = (v: number) =>
    H - PADY - ((v - min) / (max - min || 1)) * (H - PADY * 2)

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.value)}`).join(" ")
  const area = `${line} L ${x(data.length - 1)} ${H - PADY} L ${x(0)} ${H - PADY} Z`

  const yTicks = 4
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = (max / yTicks) * i
    return { v, y: y(v) }
  })

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full sm:h-52">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" className="text-primary" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" className="text-primary" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* y grid + labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PADX}
              x2={W - PADX}
              y1={t.y}
              y2={t.y}
              className="stroke-border"
              strokeDasharray="3 4"
            />
            <text
              x={PADX - 6}
              y={t.y + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[9px]"
            >
              {formatBRL(t.v).replace("R$ ", "R$ ")}
            </text>
          </g>
        ))}

        {/* area */}
        <path d={area} fill="url(#revGrad)" />
        {/* line */}
        <path d={line} fill="none" className="stroke-primary" strokeWidth="2" />

        {/* dots + x labels */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.value)} r={3.5} className="fill-primary" />
            <text
              x={x(i)}
              y={H - 4}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {d.date}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
