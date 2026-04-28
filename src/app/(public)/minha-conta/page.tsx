import type { Metadata } from "next"
import { MinhaContaContent } from "@/components/public/minha-conta-content"

export const metadata: Metadata = {
  title: "Minha Conta | Essência & Arte",
  description: "Gerencie seus pedidos, favoritos e preferências.",
}

export default function MinhaContaPage() {
  return <MinhaContaContent />
}
