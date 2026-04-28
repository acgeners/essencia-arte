"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Star,
  XCircle,
  MessageCircle,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { updateOrderStatus } from "../actions"
import { ORDER_STATUS, ORDER_STATUS_TRANSITIONS } from "@/lib/constants"
import { buildWhatsAppUrl } from "@/lib/whatsapp"
import type { OrderStatus } from "@/lib/constants"
import { cn } from "@/lib/utils"

const statusConfig: Record<OrderStatus, { icon: React.ElementType; color: string; label: string }> = {
  awaiting_payment:  { icon: Clock,        color: "text-warning",     label: "Aguardar pagamento" },
  payment_confirmed: { icon: CheckCircle2, color: "text-success",     label: "Confirmar pagamento" },
  in_production:     { icon: Clock,        color: "text-primary",     label: "Iniciar produção" },
  ready:             { icon: Package,      color: "text-accent-foreground", label: "Marcar como pronto" },
  shipped:           { icon: Truck,        color: "text-blue-600",    label: "Marcar como enviado" },
  delivered:         { icon: Star,         color: "text-success",     label: "Confirmar entrega" },
  cancelled:         { icon: XCircle,      color: "text-destructive", label: "Cancelar pedido" },
}

interface Props {
  orderId: string
  currentStatus: string
  customerName: string
  customerPhone: string
  orderCode: string
}

export function StatusActions({
  orderId,
  currentStatus,
  customerName,
  customerPhone,
  orderCode,
}: Props) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [pendingWhatsApp, setPendingWhatsApp] = useState<string | null>(null)

  const validStatus = (ORDER_STATUS_TRANSITIONS[currentStatus as OrderStatus] ?? []) as OrderStatus[]

  async function handleStatusUpdate(newStatus: OrderStatus) {
    setIsUpdating(true)
    const res = await updateOrderStatus(orderId, newStatus)
    setIsUpdating(false)

    if (!res.success) {
      toast.error(res.error ?? "Erro ao atualizar status")
      return
    }

    toast.success(`Status atualizado para: ${ORDER_STATUS[newStatus]}`)
    const url = buildWhatsAppUrl(customerPhone, newStatus, customerName, orderCode)
    setPendingWhatsApp(url)
  }

  return (
    <div className="space-y-3">
      {/* Status transition buttons */}
      <div className="space-y-2">
        {validStatus.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma ação disponível para este status.</p>
        ) : (
          validStatus.map((status) => {
            const cfg = statusConfig[status]
            const Icon = cfg.icon
            return (
              <button
                key={status}
                disabled={isUpdating}
                onClick={() => handleStatusUpdate(status)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50",
                  status === "cancelled" && "hover:border-destructive/40 hover:bg-destructive/5"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
                {cfg.label}
              </button>
            )
          })
        )}
      </div>

      {/* WhatsApp notification prompt — appears after a status change */}
      {pendingWhatsApp && (
        <div className="mt-3 rounded-[var(--radius-lg)] border border-[#25D366]/30 bg-[#25D366]/5 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              Notificar cliente sobre o novo status?
            </p>
            <button
              type="button"
              onClick={() => setPendingWhatsApp(null)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <a
            href={pendingWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setPendingWhatsApp(null)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1da851]"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar mensagem no WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
