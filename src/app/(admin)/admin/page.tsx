import { StatCard } from "@/components/ui/stat-card"
import { Package, Clock, CheckCircle2, TrendingUp } from "lucide-react"

export const metadata = {
  title: "Dashboard Admin | Essência & Arte",
}

export default function AdminDashboardPage() {
  // Mock data for KPIs
  const kpis = {
    totalRevenue: 2850.5,
    pendingOrders: 8,
    completedOrders: 45,
    conversionRate: 12.5,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Visão Geral
        </h1>
        <p className="mt-1 text-muted-foreground">
          Bem-vinda de volta ao painel da Essência & Arte.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Faturamento do Mês"
          value={`R$ ${kpis.totalRevenue.toFixed(2).replace(".", ",")}`}
          icon={TrendingUp}
          trend={{ value: 15.2, label: "este mês" }}
        />
        <StatCard
          label="Pedidos Pendentes"
          value={kpis.pendingOrders.toString()}
          icon={Clock}
        />
        <StatCard
          label="Pedidos Concluídos"
          value={kpis.completedOrders.toString()}
          icon={CheckCircle2}
        />
        <StatCard
          label="Taxa de Conversão"
          value={`${kpis.conversionRate}%`}
          icon={Package}
        />
      </div>

      {/* Recentes Mock */}
      <div className="rounded-[var(--radius-xl)] border border-border bg-card shadow-soft">
        <div className="border-b border-border p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Pedidos Recentes
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-border py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold text-foreground">
              Acompanhe seus pedidos aqui
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Vá para a guia "Pedidos" para ver e gerenciar todas as vendas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
