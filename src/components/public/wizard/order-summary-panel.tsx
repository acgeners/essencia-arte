"use client"

import type { PriceCalculation } from "@/types/domain"
import { formatBRL } from "@/lib/format"
import { Separator } from "@/components/ui/separator"
import { Heart } from "lucide-react"

interface OrderSummaryPanelProps {
  pricing: PriceCalculation
}

export function OrderSummaryPanel({ pricing }: OrderSummaryPanelProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
      <h3 className="font-display text-lg font-semibold text-foreground">
        Resumo do pedido
      </h3>

      <div className="mt-4 space-y-2">
        {pricing.breakdown.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground">
              {item.value > 0 ? formatBRL(item.value) : "Incluso"}
            </span>
          </div>
        ))}
      </div>

      {pricing.breakdown.length === 0 && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Selecione um modelo para ver o resumo
        </p>
      )}

      {pricing.total > 0 && (
        <>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatBRL(pricing.subtotal)}</span>
            </div>
            {pricing.packagingFee > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Embalagem</span>
                <span className="font-medium">{formatBRL(pricing.packagingFee)}</span>
              </div>
            )}
            {pricing.shippingFee > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Frete</span>
                <span className="font-medium">{formatBRL(pricing.shippingFee)}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{formatBRL(pricing.total)}</span>
          </div>

          <div className="mt-3 rounded-[var(--radius-md)] bg-primary/5 px-3 py-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Entrada (50%)</span>
              <span className="font-semibold text-primary">{formatBRL(pricing.deposit)}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-muted-foreground">Restante na entrega</span>
              <span className="font-medium text-foreground">{formatBRL(pricing.balance)}</span>
            </div>
          </div>
        </>
      )}

      <div className="mt-4 text-center">
        <p className="text-[10px] text-muted-foreground">
          Feito com <Heart className="inline h-2.5 w-2.5 text-primary" /> por Essência & Arte
        </p>
      </div>
    </div>
  )
}
