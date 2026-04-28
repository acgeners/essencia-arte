"use client"

import { useState } from "react"
import { Search, Package, Clock, CheckCircle2, Truck, Star } from "lucide-react"
import { cn } from "@/lib/utils"

// Status simulados (depois virão do banco de dados)
const STATUS_STEPS = [
  { id: "pending_payment", label: "Aguardando Pagamento", icon: Clock },
  { id: "confirmed", label: "Pagamento Confirmado", icon: CheckCircle2 },
  { id: "production", label: "Em Produção", icon: Star },
  { id: "shipped", label: "Enviado / Pronto para Retirada", icon: Truck },
  { id: "delivered", label: "Entregue", icon: Package },
]

export function OrderTracking() {
  const [orderCode, setOrderCode] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchedOrder, setSearchedOrder] = useState<null | any>(null)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderCode.trim()) {
      setError("Por favor, digite o código do pedido")
      return
    }

    setError("")
    setIsSearching(true)

    // Simular busca no banco de dados
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSearching(false)

    // Mock: se o código for '123', mostrar pedido não encontrado. Senão, mostrar pedido mockado.
    if (orderCode === "123") {
      setSearchedOrder(null)
      setError("Pedido não encontrado. Verifique o código e tente novamente.")
    } else {
      setSearchedOrder({
        code: orderCode.toUpperCase(),
        date: "26/04/2026",
        productName: "Caneta Personalizada",
        modelName: "Patinha de Cachorro",
        total: 20.5,
        currentStatus: "production", // Status atual no mock
        history: [
          { status: "pending_payment", date: "26/04/2026 14:30" },
          { status: "confirmed", date: "26/04/2026 15:15" },
          { status: "production", date: "27/04/2026 09:00" },
        ],
      })
    }
  }

  // Função para verificar se um passo já foi concluído ou é o atual
  const getStepState = (stepId: string, currentStatusId: string) => {
    const currentIndex = STATUS_STEPS.findIndex((s) => s.id === currentStatusId)
    const stepIndex = STATUS_STEPS.findIndex((s) => s.id === stepId)

    if (stepIndex < currentIndex) return "completed"
    if (stepIndex === currentIndex) return "current"
    return "pending"
  }

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
                placeholder="Ex: PED-12345"
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

      {/* Search Results */}
      {searchedOrder && (
        <div className="mt-8 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card shadow-soft">
          {/* Order Header */}
          <div className="border-b border-border bg-muted/30 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Pedido #{searchedOrder.code}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Realizado em {searchedOrder.date}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-primary/10 px-3 py-1.5">
                <p className="text-sm font-semibold text-primary">
                  {searchedOrder.productName} — {searchedOrder.modelName}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6 sm:p-8">
            <h3 className="mb-6 font-display text-xl font-semibold text-foreground">
              Status do Pedido
            </h3>
            
            <div className="relative">
              {/* Linha vertical que conecta os ícones */}
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-border" />

              <div className="space-y-8">
                {STATUS_STEPS.map((step) => {
                  const state = getStepState(step.id, searchedOrder.currentStatus)
                  const isCompleted = state === "completed"
                  const isCurrent = state === "current"
                  const Icon = step.icon
                  
                  // Encontrar data se houver no histórico
                  const historyItem = searchedOrder.history.find((h: any) => h.status === step.id)

                  return (
                    <div key={step.id} className="relative flex items-start gap-4">
                      {/* Círculo com Ícone */}
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

                      {/* Conteúdo */}
                      <div className="flex flex-col pt-2">
                        <span
                          className={cn(
                            "text-base font-medium",
                            isCurrent || isCompleted
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </span>
                        {historyItem && (
                          <span className="mt-0.5 text-sm text-muted-foreground">
                            {historyItem.date}
                          </span>
                        )}
                        {isCurrent && (
                          <p className="mt-2 text-sm text-primary">
                            {step.id === "pending_payment" && "Aguardando o envio do comprovante pelo WhatsApp."}
                            {step.id === "production" && "Sua peça está sendo feita à mão com muito amor!"}
                            {step.id === "shipped" && "Seu pedido está a caminho ou pronto para ser retirado."}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
