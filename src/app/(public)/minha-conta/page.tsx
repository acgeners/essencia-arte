import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { MinhaContaContent } from "@/components/public/minha-conta-content"
import { AccountAuth } from "@/components/public/account-auth"

export const metadata: Metadata = {
  title: "Minha Conta | Essência & Arte",
  description: "Gerencie seus pedidos, favoritos e preferências.",
}

export default async function MinhaContaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <AccountAuth />
  }

  return <MinhaContaContent />
}
