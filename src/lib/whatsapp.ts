import { WHATSAPP_BASE_URL } from "@/lib/constants"
import type { OrderStatus } from "@/lib/constants"

const templates: Record<OrderStatus, (name: string, code: string) => string> = {
  awaiting_payment: (name, code) =>
    `Olá ${name}! 👋 Recebemos seu pedido *#${code}*. Para confirmarmos, precisamos do pagamento da entrada via Pix. Qualquer dúvida, é só falar! ❤️ Essência & Arte`,

  payment_confirmed: (name, code) =>
    `Olá ${name}! ✅ Seu pagamento do pedido *#${code}* foi confirmado. Em breve iniciaremos a produção com muito carinho. ❤️ Essência & Arte`,

  in_production: (name, code) =>
    `Olá ${name}! ✨ Seu pedido *#${code}* está em produção! Cuidaremos de cada detalhe. Prazo estimado: 3–5 dias úteis. ❤️ Essência & Arte`,

  ready: (name, code) =>
    `Olá ${name}! 🎉 Seu pedido *#${code}* está pronto! Entre em contato para combinarmos a entrega ou retirada. ❤️ Essência & Arte`,

  shipped: (name, code) =>
    `Olá ${name}! 📦 Seu pedido *#${code}* foi enviado! Em breve você receberá o código de rastreamento. ❤️ Essência & Arte`,

  delivered: (name, code) =>
    `Olá ${name}! 💕 Seu pedido *#${code}* foi entregue! Esperamos que você ame cada detalhe. Nos manda uma foto? 😍 ❤️ Essência & Arte`,

  cancelled: (name, code) =>
    `Olá ${name}. Informamos que o pedido *#${code}* foi cancelado. Em caso de dúvidas, estamos à disposição. Essência & Arte`,
}

export function buildWhatsAppUrl(
  phone: string,
  status: OrderStatus,
  customerName: string,
  orderCode: string
): string {
  const digits = phone.replace(/\D/g, "")
  const number = digits.startsWith("55") ? digits : `55${digits}`
  const message = templates[status]?.(customerName, orderCode) ?? ""
  return `${WHATSAPP_BASE_URL}/${number}?text=${encodeURIComponent(message)}`
}
