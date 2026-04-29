"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  BellRing,
  CheckCircle2,
  FileDown,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  Package,
  ReceiptText,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { RecentOrdersPanel } from "@/components/admin/recent-orders-panel"
import { PieChart } from "@/components/admin/pie-chart"
import { StatCard } from "@/components/ui/stat-card"
import { formatBRL } from "@/lib/format"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "essencia-arte-admin-home-widgets"

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

const widgetOptions = [
  { id: "kpis", label: "Resumo geral" },
  { id: "revenue", label: "Faturamento 7 dias" },
  { id: "orders", label: "Últimos pedidos" },
  { id: "reports", label: "Relatórios" },
  { id: "production", label: "Pedidos em produção" },
  { id: "finance", label: "Financeiro" },
  { id: "integrations", label: "Integrações" },
  { id: "automations", label: "Automações" },
  { id: "security", label: "Segurança" },
] as const

type WidgetId = (typeof widgetOptions)[number]["id"]

const defaultWidgets: WidgetId[] = ["kpis", "revenue", "orders", "reports"]

function loadHomePrefs() {
  if (typeof window === "undefined") {
    return { links: ["products", "orders", "reports"], widgets: defaultWidgets }
  }
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (!saved) {
    return { links: ["products", "orders", "reports"], widgets: defaultWidgets }
  }
  try {
    const parsed = JSON.parse(saved) as { links?: string[]; widgets?: WidgetId[] }
    return {
      links: Array.isArray(parsed.links) ? parsed.links : ["products", "orders", "reports"],
      widgets: Array.isArray(parsed.widgets) ? parsed.widgets : defaultWidgets,
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return { links: ["products", "orders", "reports"], widgets: defaultWidgets }
  }
}

export function AdminHome() {
  const [selectedLinks, setSelectedLinks] = useState<string[]>(() => loadHomePrefs().links)
  const [selectedWidgets, setSelectedWidgets] = useState<WidgetId[]>(() => loadHomePrefs().widgets)
  const [customizing, setCustomizing] = useState(false)
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Home
          </h1>
          <p className="mt-1 text-muted-foreground">
            Escolha os atalhos e dados que quer ver primeiro ao abrir o painel.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCustomizing((value) => !value)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted"
        >
          <Settings2 className="h-4 w-4" />
          Personalizar Home
        </button>
      </div>

      {customizing && (
        <section className="grid gap-5 rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-soft lg:grid-cols-2">
          <div>
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

          <div>
            <h2 className="text-sm font-semibold text-foreground">Resumo geral</h2>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks
          .filter((link) => selectedLinks.includes(link.id))
          .map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="group rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
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

      {enabled.has("kpis") && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pedidos (mês)" value="128" icon={ShoppingCart} />
          <StatCard label="Faturamento (mês)" value={formatBRL(4680.5)} icon={TrendingUp} trend={{ value: 15.2, label: "vs mês anterior" }} />
          <StatCard label="Em produção" value="18" icon={Wrench} />
          <StatCard label="Entregues" value="97" icon={CheckCircle2} />
        </div>
      )}

      {enabled.has("revenue") && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Faturamento (últimos 7 dias)
          </h2>
          <div className="mt-4">
            <RevenueChart data={MOCK_REVENUE_SERIES} />
          </div>
        </section>
      )}

      {enabled.has("orders") && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Pedidos recentes
            </h2>
            <Link href="/admin/pedidos" className="text-xs font-semibold text-primary hover:underline">
              Ver todos os pedidos →
            </Link>
          </div>
          <RecentOrdersPanel orders={MOCK_RECENT_ORDERS} />
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {enabled.has("reports") && (
          <section className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-foreground">Relatórios</h2>
            <div className="mt-5 grid gap-5 2xl:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Vendas por produto</h3>
                <PieChart data={PRODUCT_REPORT} />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Formas de entrega</h3>
                <PieChart data={DELIVERY_REPORT} />
              </div>
            </div>
          </section>
        )}

        {enabled.has("finance") && (
          <section className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-foreground">Financeiro</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Faturamento", value: 4680.5, icon: TrendingUp, tone: "text-success" },
                { label: "Despesas", value: 1180.9, icon: TrendingDown, tone: "text-destructive" },
                { label: "Lucro líquido", value: 3499.6, icon: ReceiptText, tone: "text-primary" },
              ].map((item) => (
                <div key={item.label} className="rounded-[var(--radius-lg)] border border-border bg-background p-4">
                  <item.icon className={`h-4 w-4 ${item.tone}`} />
                  <p className="mt-3 text-xs text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{formatBRL(item.value)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {enabled.has("production") && (
          <section className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-foreground">Pedidos em produção</h2>
            <div className="mt-4 space-y-3">
              {MOCK_RECENT_ORDERS.filter((order) => order.status === "Em produção").map((order) => (
                <div key={order.id} className="rounded-[var(--radius-lg)] bg-primary/5 p-3">
                  <p className="text-sm font-semibold text-foreground">#{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.customer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {enabled.has("integrations") && (
          <section className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-foreground">Integrações</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: "WhatsApp", status: "Conectado", icon: MessageCircle },
                { label: "Instagram", status: "Conectado", icon: HeartHandshake },
                { label: "Google Sheets", status: "Desconectado", icon: FileDown },
              ].map((integration) => (
                <div key={integration.label} className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-background p-3 text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <integration.icon className="h-4 w-4 text-primary" />
                    {integration.label}
                  </span>
                  <span className={integration.status === "Conectado" ? "text-success" : "text-muted-foreground"}>
                    {integration.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {enabled.has("automations") && (
          <section className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold text-foreground">Automações</h2>
            <div className="mt-4 space-y-3">
              {["Confirmar pagamento", "Avisar início de produção", "Registrar na planilha"].map((automation) => (
                <div key={automation} className="flex gap-3 rounded-[var(--radius-lg)] bg-primary/5 p-3 text-sm text-foreground">
                  <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {automation}
                </div>
              ))}
            </div>
          </section>
        )}

        {enabled.has("security") && (
          <section className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success/10">
              <ShieldCheck className="h-5 w-5 text-success" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-foreground">Segurança</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Dados protegidos por autenticação administrativa e permissões no Supabase.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-lg)] border border-success/20 bg-success/5 px-3 py-2 text-xs font-semibold text-success">
              <LockKeyhole className="h-4 w-4" />
              Ambiente protegido
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
