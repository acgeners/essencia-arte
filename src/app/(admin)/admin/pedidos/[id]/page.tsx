import Link from "next/link"
import { StatusBadge } from "@/components/ui/status-badge"
import { formatBRL } from "@/lib/format"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  User,
  ShoppingBag,
  MessageCircle,
  AlertTriangle
} from "lucide-react"
import { getOrderById } from "@/server/queries/orders"
import { StatusActions } from "./status-actions"

interface PageProps {
  params: { id: string }
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const order = await getOrderById(params.id)

  if (!order) {
    return <div>Pedido não encontrado.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/pedidos"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Voltar</span>
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Pedido #{order.code}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Realizado em {new Date(order.created_at || "").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status as any} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna Principal - Detalhes do Pedido */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card Itens do Pedido */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-card shadow-soft">
            <div className="flex items-center gap-2 border-b border-border p-6">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Itens do Pedido
              </h2>
            </div>
            <div className="p-6">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex flex-col gap-4 sm:flex-row">
                  {/* Placeholder Imagem */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary/10 text-primary">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {item.products?.name || "Produto"}
                        </h3>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatBRL(item.price || 0)}
                      </p>
                    </div>

                    {/* Especificações */}
                    <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                      {item.personalization_name && (
                        <div>
                          <span className="text-muted-foreground">Nome:</span>{" "}
                          <span className="font-medium text-foreground">
                            {item.personalization_name}
                          </span>
                        </div>
                      )}
                      {item.primary_color?.name && (
                        <div>
                          <span className="text-muted-foreground">Cor P.:</span>{" "}
                          <span className="font-medium text-foreground">
                            {item.primary_color.name}
                          </span>
                        </div>
                      )}
                      {item.secondary_color?.name && (
                        <div>
                          <span className="text-muted-foreground">Cor S.:</span>{" "}
                          <span className="font-medium text-foreground">
                            {item.secondary_color.name}
                          </span>
                        </div>
                      )}
                      {item.glitter?.name && (
                        <div>
                          <span className="text-muted-foreground">Glitter:</span>{" "}
                          <span className="font-medium text-foreground">
                            {item.glitter.name}
                          </span>
                        </div>
                      )}
                      {item.tassel_color?.name && (
                        <div>
                          <span className="text-muted-foreground">Tassel:</span>{" "}
                          <span className="font-medium text-foreground">
                            {item.tassel_color.name}
                          </span>
                        </div>
                      )}
                      {item.order_item_extras && item.order_item_extras.length > 0 && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Adicionais:</span>{" "}
                          <span className="font-medium text-foreground">
                            {item.order_item_extras.map((e: any) => e.extra?.name).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Separator className="my-6" />

              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatBRL(order.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="font-medium">
                      {order.shipping_cost === 0 ? "Grátis" : formatBRL(order.shipping_cost || 0)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total do Pedido</span>
                    <span className="text-primary">{formatBRL(order.total || 0)}</span>
                  </div>
                  <div className="mt-4 rounded-[var(--radius-md)] bg-muted/50 p-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entrada Fixa (50%)</span>
                      <span className="font-medium text-foreground">{formatBRL(order.deposit || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">A receber na entrega</span>
                      <span className="font-medium text-foreground">{formatBRL(order.balance || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Lateral - Cliente, Ações, Histórico */}
        <div className="space-y-6">
          {/* Card Ações Rápidas (Mudar Status) */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-card shadow-soft">
            <div className="border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Mudar Status
              </h2>
            </div>
            <div className="p-5">
              <StatusActions
                orderId={order.id}
                currentStatus={order.status}
                customerName={order.customer_name}
                customerPhone={order.customer_phone ?? ""}
                orderCode={order.code}
              />
            </div>
          </div>

          {/* Card Cliente */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-card shadow-soft">
            <div className="flex items-center gap-2 border-b border-border p-5">
              <User className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Cliente
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-foreground">{order.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_email || "Sem e-mail"}</p>
                </div>
                <button
                  onClick={undefined} // No SSR on onClick
                  className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[#25D366]/10 px-4 py-2.5 text-sm font-medium text-[#1da851] transition-colors hover:bg-[#25D366]/20"
                >
                  <Link href={`https://wa.me/55${order.customer_phone}`} target="_blank" className="flex items-center gap-2 w-full justify-center">
                    <MessageCircle className="h-4 w-4" />
                    {order.customer_phone}
                  </Link>
                </button>
                
                {order.customer_notes && (
                  <div className="rounded-[var(--radius-md)] bg-warning/10 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-warning">
                      <AlertTriangle className="h-4 w-4" />
                      Observações
                    </div>
                    <p className="mt-1 text-sm text-warning/90">{order.customer_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
