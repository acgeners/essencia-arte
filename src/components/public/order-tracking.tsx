"use client"

import { useState } from "react"
import { Search, Package, Clock, CheckCircle2, Truck, Star, Heart, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ORDER_STATUS, type OrderStatus } from "@/lib/constants"
import { trackOrder, type TrackedOrder } from "@/app/(public)/pedido/acompanhar/actions"

const STATUS_STEPS: { id: OrderStatus; icon: React.ElementType }[] = [
  { id: "pending_payment", icon: Clock },
  { id: "payment_confirmed", icon: CheckCircle2 },
  { id: "in_production", icon: Star },
  { id: "ready", icon: Package },
  { id: "shipped", icon: Truck },
  { id: "delivered", icon: Heart },
]

export function OrderTracking() {
  const [orderCode, setOrderCode] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = orderCode.trim()
    if (!code) {
      setError("Por favor, digite o código do pedido")
      return
    }
    setError("")
    setOrder(null)
    setIsSearching(true)
    try {
      const result = await trackOrder(code)
      if (!result) {
        setError("Pedido não encontrado. Verifique o código e tente novamente.")
      } else {
        setOrder(result)
      }
    } catch {
      setError("Não foi possível buscar o pedido agora. Tente novamente.")
    } finally {
      setIsSearching(false)
    }
  }

  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—"

  const isCancelled = order?.status === "cancelled"
  const currentIndex = order ? STATUS_STEPS.findIndex((s) => s.id === order.status) : -1

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
          Acompanhar Pedido
        </h1>
        <p className="mt-2 text-muted-foreground">
          Digite o código que você recebeu no WhatsApp
        </p>
      </div>

      {/* Search Form */}
      <div className="mt-8 rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft sm:p-8">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="order-code" className="sr-only">
              Código do Pedido
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="order-code"
                type="text"
                placeholder="Ex: PED-1A2B"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                className="flex h-12 w-full rounded-[var(--radius-md)] border border-input bg-background pl-10 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring uppercase"
              />
            </div>
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isSearching ? "Buscando..." : "Buscar Pedido"}
          </button>
        </form>
      </div>

      {/* Result */}
      {order && (
        <div className="mt-8 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card shadow-soft">
          {/* Order Header */}
          <div className="border-b border-border bg-muted/30 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Pedido #{order.code}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Realizado em {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5">
                <p className="text-sm font-semibold text-primary">{order.productName}</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {isCancelled ? (
              <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-destructive/30 bg-destructive/5 p-4">
                <XCircle className="h-6 w-6 shrink-0 text-destructive" />
                <div>
                  <p className="text-base font-semibold text-foreground">Pedido cancelado</p>
                  <p className="text-sm text-muted-foreground">
                    Em caso de dúvida, fale com a gente pelo WhatsApp.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h3 className="mb-6 font-display text-xl font-semibold text-foreground">
                  Status do Pedido
                </h3>
                <div className="relative">
                  {/* Linha vertical que conecta os ícones */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border" />

                  <div className="space-y-8">
                    {STATUS_STEPS.map((step, i) => {
                      const isCompleted = currentIndex >= 0 && i < currentIndex
                      const isCurrent = i === currentIndex
                      const Icon = step.icon

                      return (
                        <div key={step.id} className="relative flex items-start gap-4">
                          <div
                            className={cn(
                              "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                              isCompleted
                                ? "border-primary bg-primary text-primary-foreground"
                                : isCurrent
                                  ? "border-primary bg-card text-primary"
                                  : "border-border bg-card text-muted-foreground"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col pt-2">
                            <span
                              className={cn(
                                "text-base font-medium",
                                isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {ORDER_STATUS[step.id]}
                            </span>
                            {isCurrent && (
                              <p className="mt-2 text-sm text-primary">
                                {step.id === "pending_payment" &&
                                  "Aguardando o pagamento da entrada via PIX."}
                                {step.id === "in_production" &&
                                  "Sua peça está sendo feita à mão com muito amor!"}
                                {step.id === "shipped" &&
                                  "Seu pedido está a caminho ou pronto para retirada."}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <p className="mt-6 text-xs text-muted-foreground">
                  As atualizações de status são enviadas pelo WhatsApp.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
