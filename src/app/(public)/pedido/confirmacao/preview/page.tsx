import type { Metadata } from "next"
import { OrderConfirmation } from "@/components/public/wizard/order-confirmation"
import { getFullCatalog } from "@/server/queries/catalog"

export const metadata: Metadata = {
  title: "Confirmar Pedido | Essência & Arte",
  description: "Revise e confirme seu pedido personalizado.",
}

export default async function OrderConfirmationPage() {
  const catalog = await getFullCatalog()

  return (
    <div className="bg-background min-h-screen">
      <OrderConfirmation catalog={catalog} />
    </div>
  )
}
