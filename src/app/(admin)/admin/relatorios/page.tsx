import { BarChart3, TrendingUp, Package, Clock } from "lucide-react"

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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios e Métricas</h1>
        <p className="text-sm text-muted-foreground mt-1">Análise de desempenho da loja em tempo real.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase">{card.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[300px] flex items-center justify-center text-center">
          <div className="text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Gráfico de Vendas Semanais</p>
            <p className="text-[10px] uppercase font-bold mt-1">(Em desenvolvimento)</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm min-h-[300px] flex items-center justify-center text-center">
          <div className="text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Produtos mais Vendidos</p>
            <p className="text-[10px] uppercase font-bold mt-1">(Em desenvolvimento)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
