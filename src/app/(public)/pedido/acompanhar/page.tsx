import type { Metadata } from "next"
import { OrderTracking } from "@/components/public/order-tracking"

export const metadata: Metadata = {
  title: "Acompanhar Pedido | Essência & Arte",
  description: "Acompanhe o status do seu pedido personalizado em tempo real.",
}

export default function OrderTrackingPage() {
  return (
    <div className="min-h-screen bg-background">
      <OrderTracking />
    </div>
  )
}
