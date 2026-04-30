"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type Status = "Pagamento confirmado" | "Em produção" | "Aguardando pagamento" | "Finalizado"

interface OrderRow {
  id: string
  customer: string
  date: string
  status: Status
}

const STATUS_STYLES: Record<Status, string> = {
  "Pagamento confirmado": "bg-success/10 text-success",
  "Em produção": "bg-primary/10 text-primary",
  "Aguardando pagamento": "bg-warning/15 text-warning",
  "Finalizado": "bg-muted text-muted-foreground",
}

const TABS = ["Todos", "Recebidos", "Em produção", "Finalizados"] as const

function matchesTab(tab: (typeof TABS)[number], status: Status): boolean {
  switch (tab) {
    case "Todos":
      return true
    case "Recebidos":
      return status === "Pagamento confirmado" || status === "Aguardando pagamento"
    case "Em produção":
      return status === "Em produção"
    case "Finalizados":
      return status === "Finalizado"
  }
}

export function RecentOrdersPanel({ orders }: { orders: OrderRow[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Todos")
  const filtered = orders.filter((o) => matchesTab(tab, o.status))

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 sm:gap-2 sm:px-5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              tab === t
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-border">
        {filtered.length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-muted-foreground">
            Nenhum pedido nesta aba.
          </li>
        )}
        {filtered.map((o) => (
          <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 sm:px-5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">#{o.id}</p>
              <p className="truncate text-xs text-muted-foreground">{o.customer}</p>
              <p className="text-[10px] text-muted-foreground">{o.date}</p>
            </div>
            <span
              className={cn(
                "max-w-[112px] shrink-0 truncate rounded-full px-2.5 py-1 text-[10px] font-semibold sm:max-w-none",
                STATUS_STYLES[o.status]
              )}
            >
              {o.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
