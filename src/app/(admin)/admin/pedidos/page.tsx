import Link from "next/link"
import { StatusBadge } from "@/components/ui/status-badge"
import { Search, ChevronRight } from "lucide-react"

export const metadata = {
  title: "Pedidos | Essência & Arte",
}

import { getOrders } from "@/server/queries/orders"

export default async function AdminOrdersPage() {
  const orders = await getOrders()
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Pedidos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie todas as suas encomendas aqui.
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-border bg-card shadow-soft">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por código ou cliente..."
              className="flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            <select className="h-10 rounded-[var(--radius-md)] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="all">Todos os status</option>
              <option value="pending_payment">Aguardando Pagamento</option>
              <option value="confirmed">Confirmado</option>
              <option value="production">Em Produção</option>
            </select>
          </div>
        </div>

        {/* Table/List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Código</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Total</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                    {order.code}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                    {new Date(order.created_at || "").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {order.order_items?.[0]?.products?.name || "Produto"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={order.status as any} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-foreground">
                    R$ {(order.total || 0).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Ver detalhes</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
