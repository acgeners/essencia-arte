"use client"

import { useState, useEffect, useRef } from "react"
import { useWizardStore } from "@/stores/wizard-store"
import { useCatalog } from "@/components/public/wizard/catalog-context"
import { cn } from "@/lib/utils"
import { MapPin, Truck, Package, Loader2, CheckCircle2, AlertCircle } from "lucide-react"

type CepResult = {
  street: string
  district: string
  city: string
  state: string
}

function freightByUF(uf: string): { pac: number; sedex: number } {
  if (uf === "SP") return { pac: 12.9, sedex: 24.9 }
  if (["RJ", "MG", "ES", "PR", "SC", "RS"].includes(uf)) return { pac: 17.9, sedex: 32.9 }
  if (["DF", "GO", "MT", "MS", "TO"].includes(uf)) return { pac: 21.9, sedex: 38.9 }
  return { pac: 28.9, sedex: 49.9 }
}

export function StepDelivery() {
  const { delivery, setDelivery } = useWizardStore()
  const catalog = useCatalog()

  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)
  const [cepResult, setCepResult] = useState<CepResult | null>(
    delivery.address
      ? {
          street: delivery.address.street,
          district: delivery.address.district,
          city: delivery.address.city,
          state: delivery.address.state,
        }
      : null
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const deliveryTypes = [
    { type: "pickup" as const, label: "Retirar pessoalmente", icon: MapPin },
    { type: "correios" as const, label: "Correios", icon: Truck },
    { type: "transportadora" as const, label: "Transportadora", icon: Package },
  ]

  const correiosOptions = catalog.shippingOptions.filter(
    (s) => s.name === "PAC" || s.name === "SEDEX"
  )
  const pickupOption = catalog.shippingOptions.find((s) => s.name === "Retirar pessoalmente")
  const transportadoraOption = catalog.shippingOptions.find((s) => s.name === "Transportadora")

  async function fetchCep(rawCep: string) {
    setCepLoading(true)
    setCepError(null)
    setCepResult(null)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`)
      const data = await res.json()
      if (data.erro) {
        setCepError("CEP nao encontrado. Verifique e tente novamente.")
        setDelivery({ address: null })
        return
      }
      const result: CepResult = {
        street: data.logradouro ?? "",
        district: data.bairro ?? "",
        city: data.localidade ?? "",
        state: data.uf ?? "",
      }
      setCepResult(result)
      setDelivery({
        address: {
          street: result.street,
          number: delivery.address?.number ?? "",
          complement: delivery.address?.complement ?? "",
          district: result.district,
          city: result.city,
          state: result.state,
        },
      })
    } catch {
      setCepError("Erro ao buscar CEP. Verifique sua conexao.")
      setDelivery({ address: null })
    } finally {
      setCepLoading(false)
    }
  }

  function handleCepChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8)
    setDelivery({ cep: digits })
    setCepError(null)
    if (digits.length < 8) {
      setCepResult(null)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCep(digits), 400)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function formatCep(digits: string) {
    if (digits.length <= 5) return digits
    return digits.slice(0, 5) + "-" + digits.slice(5)
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-foreground">Entrega</h2>
      <p className="mt-1 text-sm text-muted-foreground">Como deseja receber seu pedido?</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {deliveryTypes.map((dt) => (
          <button
            key={dt.type}
            type="button"
            onClick={() => {
              if (dt.type === "pickup") {
                setDelivery({ type: "pickup", shippingOptionId: pickupOption?.id ?? null })
              } else if (dt.type === "transportadora") {
                setDelivery({ type: "transportadora", shippingOptionId: transportadoraOption?.id ?? null })
              } else {
                setDelivery({ type: "correios", shippingOptionId: null })
              }
            }}
            className={cn(
              "flex flex-col items-center gap-2 rounded-[var(--radius-xl)] border-2 p-5 transition-all duration-200",
              delivery.type === dt.type
                ? "border-primary bg-primary/5 shadow-card"
                : "border-border hover:border-primary/30"
            )}
          >
            <dt.icon className={cn("h-6 w-6", delivery.type === dt.type ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm font-semibold text-foreground">{dt.label}</span>
          </button>
        ))}
      </div>

      {delivery.type === "pickup" && (
        <div className="mt-6 rounded-[var(--radius-md)] bg-primary/5 px-4 py-3">
          <p className="text-sm font-medium text-foreground">Retirada no local</p>
          <p className="mt-1 text-sm text-muted-foreground">
            O endereco e horarios de retirada serao confirmados por WhatsApp apos o pedido.
          </p>
        </div>
      )}

      {delivery.type === "correios" && (
        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">CEP de entrega</label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatCep(delivery.cep)}
                  placeholder="00000-000"
                  onChange={(e) => handleCepChange(e.target.value)}
                  className={cn(
                    "h-10 w-36 rounded-[var(--radius-md)] border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    cepError ? "border-destructive" : "border-input"
                  )}
                />
                {cepLoading && (
                  <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {cepResult && !cepLoading && (
                <div className="flex items-center gap-1.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">{cepResult.city} - {cepResult.state}</span>
                </div>
              )}
            </div>
            {cepError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {cepError}
              </p>
            )}
            {cepResult && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {[cepResult.street, cepResult.district].filter(Boolean).join(", ")}
              </p>
            )}
          </div>

          {correiosOptions.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Modalidade</p>
              {correiosOptions.map((opt) => {
                const freight = cepResult ? freightByUF(cepResult.state) : null
                const dynamicPrice = freight
                  ? opt.name === "PAC" ? freight.pac : freight.sedex
                  : (opt.price ?? 0)
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDelivery({ shippingOptionId: opt.id })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[var(--radius-lg)] border-2 px-5 py-4 transition-all duration-200",
                      delivery.shippingOptionId === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{opt.name}</p>
                      {opt.name === "PAC" && (
                        <p className="text-xs text-muted-foreground">Prazo estimado: 5-8 dias uteis</p>
                      )}
                      {opt.name === "SEDEX" && (
                        <p className="text-xs text-muted-foreground">Prazo estimado: 1-3 dias uteis</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      R$ {dynamicPrice.toFixed(2).replace(".", ",")}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {delivery.type === "transportadora" && (
        <div className="mt-6 rounded-[var(--radius-md)] bg-muted/50 px-4 py-3">
          <p className="text-sm font-medium text-foreground">Transportadora / Motoboy</p>
          <p className="mt-1 text-sm text-muted-foreground">
            O valor e prazo serao combinados por WhatsApp apos a confirmacao do pedido.
          </p>
        </div>
      )}
    </div>
  )
}
