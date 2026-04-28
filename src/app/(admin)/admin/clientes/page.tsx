import { getAdminCustomers } from "@/server/queries/admin/customers"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Users, Mail, Phone, ShoppingBag } from "lucide-react"
import { formatBRL } from "@/lib/format"

export const metadata = {
  title: "Clientes | Admin",
}

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Gestão de Clientes</h1>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-md text-sm font-medium">
          Total: {customers.length} clientes
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {customer.full_name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{customer.full_name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>
                    {customer.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground uppercase text-[10px] font-bold">Pedidos</p>
                  <p className="text-lg font-bold text-foreground">{customer.orders.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground uppercase text-[10px] font-bold">Total Gasto</p>
                  <p className="text-lg font-bold text-primary">
                    {formatBRL(customer.orders.reduce((acc, o) => acc + Number(o.total), 0))}
                  </p>
                </div>
              </div>
            </div>

            {customer.orders.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                  <ShoppingBag className="h-3 w-3" /> Últimos Pedidos
                </h4>
                <div className="flex flex-wrap gap-2">
                  {customer.orders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="bg-muted/50 rounded-md px-3 py-2 text-xs border border-border">
                      <span className="font-bold">{order.code}</span>
                      <span className="mx-2 text-muted-foreground">|</span>
                      <span>{formatBRL(order.total)}</span>
                      <span className="mx-2 text-muted-foreground">|</span>
                      <span className="text-muted-foreground">{format(new Date(order.created_at), "dd/MM/yy", { locale: ptBR })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {customers.length === 0 && (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum cliente cadastrado no momento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
