import { formatBRL } from "@/lib/format"
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"

export const metadata = {
  title: "Financeiro | Admin",
}

export default async function AdminFinancePage() {
  // Mock data por enquanto
  const stats = [
    { label: "Receita Total", value: 12500.50, icon: Wallet, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Entradas (Sinal)", value: 6250.25, icon: ArrowUpRight, color: "text-green-500", bg: "bg-green-50" },
    { label: "A Receber", value: 6250.25, icon: ArrowDownRight, color: "text-orange-500", bg: "bg-orange-50" },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão Financeira</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhamento de entradas e fluxo de caixa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{formatBRL(stat.value)}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Últimas Transações</h3>
        <div className="text-center py-12 text-muted-foreground">
          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>O detalhamento das transações será implementado na Fase de Conciliação.</p>
        </div>
      </div>
    </div>
  )
}
