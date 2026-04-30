"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  CheckCircle2,
  Package,
  ReceiptText,
  Settings2,
  ShoppingCart,
  TrendingUp,
  Wrench,
} from "lucide-react"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { RecentOrdersPanel } from "@/components/admin/recent-orders-panel"
import { PieChart } from "@/components/admin/pie-chart"
import { StatCard } from "@/components/ui/stat-card"
import { formatBRL } from "@/lib/format"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "essencia-arte-admin-home-widgets-v2"

const MOCK_REVENUE_SERIES = [
  { date: "05/05", value: 320 },
  { date: "06/05", value: 480 },
  { date: "07/05", value: 410 },
  { date: "08/05", value: 720 },
  { date: "09/05", value: 690 },
  { date: "10/05", value: 850 },
  { date: "11/05", value: 1210 },
]

const MOCK_RECENT_ORDERS = [
  { id: "12345", customer: "Maria Silva", date: "10/05/2024 10:30", status: "Pagamento confirmado" as const },
  { id: "12344", customer: "Jessica Lima", date: "10/05/2024 09:15", status: "Em produção" as const },
  { id: "12343", customer: "Ana Costa", date: "09/05/2024 16:40", status: "Aguardando pagamento" as const },
  { id: "12342", customer: "Carla Luna", date: "09/05/2024 14:20", status: "Finalizado" as const },
]

const PRODUCT_REPORT = [
  { label: "Canetas", value: 42, color: "#BA7A72" },
  { label: "Chaveiros", value: 28, color: "#E6A09A" },
  { label: "Letras", value: 18, color: "#D8A85F" },
  { label: "Kits", value: 12, color: "#8FAE9A" },
]

const DELIVERY_REPORT = [
  { label: "Correios PAC", value: 36, color: "#BA7A72" },
  { label: "SEDEX", value: 20, color: "#E6A09A" },
  { label: "Retirada", value: 30, color: "#8FAE9A" },
  { label: "Transportadora", value: 14, color: "#D8A85F" },
]

const quickLinks = [
  { id: "products", label: "Produtos", href: "/admin/produtos", icon: Package },
  { id: "orders", label: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
  { id: "reports", label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
  { id: "finance", label: "Financeiro", href: "/admin/financeiro", icon: ReceiptText },
]

const suggestedLinkIds = ["products", "orders", "reports"]

const widgetOptions = [
  { id: "kpis", label: "Resumo geral" },
  { id: "orders", label: "Últimos pedidos" },
  { id: "revenue", label: "Faturamento 7 dias" },
  { id: "reports", label: "Relatórios" },
] as const

type WidgetId = (typeof widgetOptions)[number]["id"]

const defaultWidgets: WidgetId[] = []
const defaultLinks = ["products", "orders"]

function loadHomePrefs() {
  if (typeof window === "undefined") {
    return { links: defaultLinks, widgets: defaultWidgets }
  }
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (!saved) {
    return { links: defaultLinks, widgets: defaultWidgets }
  }
  try {
    const parsed = JSON.parse(saved) as { links?: string[]; widgets?: WidgetId[] }
    return {
      links: Array.isArray(parsed.links) ? parsed.links : defaultLinks,
      widgets: Array.isArray(parsed.widgets) ? parsed.widgets : defaultWidgets,
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return { links: defaultLinks, widgets: defaultWidgets }
  }
}

export function AdminHome() {
  const [selectedLinks, setSelectedLinks] = useState<string[]>(() => loadHomePrefs().links)
  const [selectedWidgets, setSelectedWidgets] = useState<WidgetId[]>(() => loadHomePrefs().widgets)
  const [customizing, setCustomizing] = useState(true)
  const enabled = useMemo(() => new Set(selectedWidgets), [selectedWidgets])

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ links: selectedLinks, widgets: selectedWidgets })
    )
  }, [selectedLinks, selectedWidgets])

  function toggleLink(id: string) {
    setSelectedLinks((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  function toggleWidget(id: WidgetId) {
    setSelectedWidgets((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const visibleLinks = quickLinks.filter((link) => selectedLinks.includes(link.id))
  const suggestedLinks = quickLinks.filter((link) => suggestedLinkIds.includes(link.id))

  return (
    <div className="min-w-0 max-w-full space-y-6 overflow-hidden sm:space-y-8">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Home
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground sm:text-base">
            Escolha apenas os atalhos e blocos que quer ver primeiro ao abrir o painel.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCustomizing((value) => !value)}
          className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted sm:w-auto"
        >
          <Settings2 className="h-4 w-4" />
          Personalizar Home
        </button>
      </div>

      {customizing && (
        <section className="grid min-w-0 gap-5 rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-soft sm:p-5 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Atalhos favoritos</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => toggleLink(link.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    selectedLinks.includes(link.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Blocos sugeridos</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {widgetOptions.map((widget) => (
                <button
                  key={widget.id}
                  type="button"
                  onClick={() => toggleWidget(widget.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    selectedWidgets.includes(widget.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {widget.label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Sugestões rápidas</h2>
          <span className="text-xs text-muted-foreground">Edite acima</span>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(visibleLinks.length > 0 ? visibleLinks : suggestedLinks).map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="group min-w-0 rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card sm:p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <link.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 font-display text-xl font-semibold text-foreground">
                {link.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground group-hover:text-foreground">
                Abrir {link.label.toLowerCase()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {selectedWidgets.length === 0 && (
        <section className="rounded-[var(--radius-xl)] border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground sm:p-5">
          Nenhum bloco de dados está fixado por padrão. Use “Personalizar Home” para exibir apenas o que for útil no seu dia a dia.
        </section>
      )}

      {enabled.has("kpis") && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pedidos (mês)" value="128" icon={ShoppingCart} />
          <StatCard label="Faturamento (mês)" value={formatBRL(4680.5)} icon={TrendingUp} trend={{ value: 15.2, label: "vs mês anterior" }} />
          <StatCard label="Em produção" value="18" icon={Wrench} />
          <StatCard label="Entregues" value="97" icon={CheckCircle2} />
        </div>
      )}

      {enabled.has("revenue") && (
        <section className="min-w-0 rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-soft sm:p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Faturamento (últimos 7 dias)
          </h2>
          <div className="mt-4 min-w-0">
            <RevenueChart data={MOCK_REVENUE_SERIES} />
          </div>
        </section>
      )}

      {enabled.has("orders") && (
        <section className="min-w-0 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Pedidos recentes
            </h2>
            <Link href="/admin/pedidos" className="shrink-0 text-xs font-semibold text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <RecentOrdersPanel orders={MOCK_RECENT_ORDERS} />
        </section>
      )}

      {enabled.has("reports") && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-soft sm:p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Relatórios</h2>
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <div className="min-w-0">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Vendas por produto</h3>
              <PieChart data={PRODUCT_REPORT} />
            </div>
            <div className="min-w-0">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Formas de entrega</h3>
              <PieChart data={DELIVERY_REPORT} />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
