import { PieChart } from "@/components/admin/pie-chart"
import { BarChart3, Clock, FileDown, Package, TrendingUp } from "lucide-react"

export const metadata = {
  title: "Relatórios | Admin",
}

export default async function AdminReportsPage() {
  const cards = [
    { label: "Taxa de Conversão", value: "3.2%", icon: TrendingUp, color: "text-indigo-500" },
    { label: "Ticket Médio", value: "R$ 45,90", icon: BarChart3, color: "text-emerald-500" },
    { label: "Produtos Ativos", value: "24", icon: Package, color: "text-amber-500" },
    { label: "Tempo Médio Prod.", value: "4 dias", icon: Clock, color: "text-rose-500" },
  ]

  const salesByProduct = [
    { label: "Canetas", value: 42, color: "#BA7A72" },
    { label: "Chaveiros", value: 28, color: "#E6A09A" },
    { label: "Letras", value: 18, color: "#D8A85F" },
    { label: "Kits", value: 12, color: "#8FAE9A" },
  ]

  const deliveryMethods = [
    { label: "Correios PAC", value: 36, color: "#BA7A72" },
    { label: "SEDEX", value: 20, color: "#E6A09A" },
    { label: "Retirada", value: 30, color: "#8FAE9A" },
    { label: "Transportadora", value: 14, color: "#D8A85F" },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Relatórios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Análise de desempenho da loja em tempo real.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select className="h-10 rounded-[var(--radius-md)] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Este mês</option>
            <option>Mês anterior</option>
          </select>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <FileDown className="h-4 w-4" />
            Exportar relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card, i) => (
          <div key={i} className="rounded-[var(--radius-lg)] border border-border bg-card p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase">{card.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Vendas por produto
            </h2>
            <p className="text-xs text-muted-foreground">
              Participação de cada categoria nos pedidos do período.
            </p>
          </div>
          <PieChart data={salesByProduct} />
        </section>

        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Formas de entrega
            </h2>
            <p className="text-xs text-muted-foreground">
              Distribuição entre retirada, Correios e transportadora.
            </p>
          </div>
          <PieChart data={deliveryMethods} />
        </section>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Produtos em destaque
        </h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-border">
                <th className="pb-3 font-semibold">Produto</th>
                <th className="pb-3 font-semibold">Pedidos</th>
                <th className="pb-3 font-semibold">Faturamento</th>
                <th className="pb-3 font-semibold">Entrega principal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Caneta personalizada", "42", "R$ 1.932,00", "Correios PAC"],
                ["Chaveiro resinato", "28", "R$ 980,00", "Retirada"],
                ["Letra decorativa", "18", "R$ 1.170,00", "SEDEX"],
              ].map(([product, orders, revenue, delivery]) => (
                <tr key={product}>
                  <td className="py-3 font-medium text-foreground">{product}</td>
                  <td className="py-3 text-muted-foreground">{orders}</td>
                  <td className="py-3 text-muted-foreground">{revenue}</td>
                  <td className="py-3 text-muted-foreground">{delivery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
