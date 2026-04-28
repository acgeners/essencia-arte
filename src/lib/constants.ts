/**
 * Constantes globais do Essência & Arte
 */

/** Status de pedido com labels em pt-BR */
export const ORDER_STATUS = {
  awaiting_payment: "Aguardando pagamento",
  payment_confirmed: "Pagamento confirmado",
  in_production: "Em produção",
  ready: "Pronto",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
} as const

export type OrderStatus = keyof typeof ORDER_STATUS

/** Cores semânticas por status (para badges) */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  awaiting_payment: "bg-warning/15 text-warning",
  payment_confirmed: "bg-success/15 text-success",
  in_production: "bg-primary/15 text-primary",
  ready: "bg-accent/30 text-foreground",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
}

/** Transições válidas de status (máquina de estados) */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  awaiting_payment: ["payment_confirmed", "cancelled"],
  payment_confirmed: ["in_production", "cancelled"],
  in_production: ["ready", "cancelled"],
  ready: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
}

/** Status de comprovante de pagamento */
export const PAYMENT_PROOF_STATUS = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
} as const

/** Taxa de entrada padrão (50%) */
export const DEFAULT_DEPOSIT_RATE = 0.5

/** Limite de caracteres padrão para nome personalizado */
export const DEFAULT_NAME_CHAR_LIMIT = 15

/** Prazo de produção padrão em dias úteis */
export const DEFAULT_PRODUCTION_DAYS = { min: 3, max: 5 }

/** Limite de upload de comprovante */
export const UPLOAD_MAX_SIZE_MB = 5
export const UPLOAD_MAX_SIZE_BYTES = UPLOAD_MAX_SIZE_MB * 1024 * 1024
export const UPLOAD_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]

/** Número de itens por página em listagens */
export const PAGE_SIZE = 20

/** WhatsApp base URL */
export const WHATSAPP_BASE_URL = "https://wa.me"
