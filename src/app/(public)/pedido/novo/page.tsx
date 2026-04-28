import type { Metadata } from "next"
import { Suspense } from "react"
import { WizardShell } from "@/components/public/wizard/wizard-shell"
import { getFullCatalog } from "@/server/queries/catalog"

export const metadata: Metadata = {
  title: "Criar Pedido",
  description: "Monte seu produto personalizado passo a passo",
}

export default async function NovoPedidoPage() {
  const catalog = await getFullCatalog()

  return (
    <Suspense fallback={<WizardLoading />}>
      <WizardShell catalog={catalog} />
    </Suspense>
  )
}

function WizardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 h-10 animate-pulse rounded-[var(--radius-lg)] bg-muted" />
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="h-96 animate-pulse rounded-[var(--radius-xl)] bg-muted" />
        </div>
        <div className="hidden w-80 lg:block">
          <div className="h-64 animate-pulse rounded-[var(--radius-xl)] bg-muted" />
        </div>
      </div>
    </div>
  )
}
