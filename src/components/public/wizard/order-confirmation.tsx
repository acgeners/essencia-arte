"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import QRCode from "react-qr-code"
import { useWizardStore } from "@/stores/wizard-store"
import { calculatePrice } from "@/lib/pricing/calculate"
import { generatePixPayload } from "@/lib/pix"
import { createOrderAction } from "@/app/(public)/pedido/confirmacao/actions"
import type { FullCatalog } from "@/server/queries/catalog"
import { formatBRL } from "@/lib/format"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  ArrowLeft,
  Copy,
  Check,
  AlertTriangle,
  User,
  Phone,
  Mail,
  FileText,
  ShoppingBag,
  Palette,
  Sparkles,
  Gift,
  Truck,
  MessageCircle,
  Plus,
  Upload,
  QrCode,
  Banknote,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/stores/cart-store"

export function OrderConfirmation({ catalog }: { catalog: FullCatalog }) {
  const store = useWizardStore()
  const router = useRouter()
  const pricing = useMemo(() => calculatePrice(store, catalog), [store, catalog])
  const cartStore = useCartStore()
  const [addedToCart, setAddedToCart] = useState(false)

  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [pixCopied, setPixCopied] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "transfer">("pix")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null)

  // Resolve names from IDs
  const modelName =
    catalog.products.find((m) => m.id === store.productId)?.name ?? "—"
  const primaryColor =
    catalog.colors.find((c) => c.id === store.colors.primaryId)?.name ?? "—"
  const secondaryColor = store.colors.secondaryEnabled
    ? catalog.colors.find((c) => c.id === store.colors.secondaryId)?.name
    : null
  const glitterName = store.glitter.enabled
    ? catalog.glitters.find((g) => g.id === store.glitter.glitterId)?.name
    : null
  const tasselColor = store.glitter.enabled
    ? catalog.tasselColors.find((t) => t.id === store.glitter.tasselColorId)
        ?.name
    : null
  const selectedExtras = store.extras
    .map((id) => catalog.extras.find((e) => e.id === id))
    .filter(Boolean)
  const packagingName =
    catalog.packagingOptions.find((p) => p.id === store.packaging.optionId)
      ?.name ?? "—"
  const shippingName =
    catalog.shippingOptions.find(
      (s) => s.id === store.delivery.shippingOptionId
    )?.name ?? "—"
  const categoryName =
    catalog.categories.find((c) => c.slug === store.categorySlug)?.name ?? "—"

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!customerData.name.trim()) newErrors.name = "Nome é obrigatório"
    if (!customerData.phone.trim()) newErrors.phone = "Telefone é obrigatório"
    else if (customerData.phone.replace(/\D/g, "").length < 10)
      newErrors.phone = "Telefone inválido"
    if (
      customerData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)
    )
      newErrors.email = "E-mail inválido"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setIsSubmitting(true)

    const res = await createOrderAction(store, customerData)

    setIsSubmitting(false)

    if (!res.success) {
      // Usando alert nativo para simplificar, mas num caso real poderia ser um Toast
      alert(res.error)
      return
    }

    setConfirmedOrderId(res.orderId ?? null)
    setIsSubmitted(true)
  }

  const pixKey = process.env.NEXT_PUBLIC_PIX_KEY ?? "email@essenciaearte.com.br"

  const pixPayload = useMemo(
    () =>
      generatePixPayload({
        key: pixKey,
        merchantName: "Essencia e Arte",
        merchantCity: "SAO PAULO",
        amount: pricing.deposit,
        description: "Entrada pedido EA",
      }),
    [pixKey, pricing.deposit]
  )

  function handleCopyPix() {
    navigator.clipboard.writeText(pixKey).then(() => {
      setPixCopied(true)
      setTimeout(() => setPixCopied(false), 2000)
    })
  }

  function handleAddToCart() {
    const modelName =
      catalog.products.find((m) => m.id === store.productId)?.name ?? "Produto"
    const catName =
      catalog.categories.find((c) => c.slug === store.categorySlug)?.name ?? ""
    const displayName = catName ? `${catName} – ${modelName}` : modelName

    cartStore.addItem({
      wizardState: { ...store },
      displayName,
      categoryName: catName,
      totalPrice: pricing.total,
      depositAmount: pricing.deposit,
    })

    setAddedToCart(true)
    setTimeout(() => {
      store.reset()
      router.push("/pedido/novo?sacola=1")
    }, 800)
  }

  function handleWhatsApp() {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511999999999"
    const msg = encodeURIComponent(
      `Olá! Acabei de fazer um pedido no site:\n\n` +
        `📦 ${categoryName} — ${modelName}\n` +
        `💰 Total: ${formatBRL(pricing.total)}\n` +
        `💳 Entrada: ${formatBRL(pricing.deposit)}\n\n` +
        `Nome: ${customerData.name}\nTelefone: ${customerData.phone}`
    )
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank")
  }

  // Redirect if wizard is empty
  if (!store.productId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Nenhum pedido em andamento
        </h2>
        <p className="mt-2 text-muted-foreground">
          Monte seu pedido personalizado antes de confirmar.
        </p>
        <button
          type="button"
          onClick={() => router.push("/pedido/novo")}
          className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover"
        >
          Criar meu pedido
        </button>
      </div>
    )
  }

  // Success screen — Pedido confirmado #
  if (isSubmitted) {
    const shortOrderNumber = confirmedOrderId
      ? `#${confirmedOrderId.toString().slice(0, 5).toUpperCase()}`
      : "#—"

    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <div className="rounded-[var(--radius-xl)] border border-border bg-card p-8 text-center shadow-card sm:p-12">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <Check className="h-10 w-10 text-success" />
            <Heart className="absolute -right-1 -top-1 h-5 w-5 fill-primary text-primary" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold text-foreground">
            Pedido confirmado!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu pedido só será confirmado após a baixa do pagamento.
          </p>

          <div className="mt-6 inline-flex flex-col items-center rounded-[var(--radius-lg)] border border-dashed border-primary/40 bg-primary/5 px-6 py-3">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Número do pedido
            </span>
            <span className="font-display text-2xl font-bold text-primary">{shortOrderNumber}</span>
          </div>

          <Separator className="my-8" />

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => router.push("/pedido/acompanhar")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover sm:w-auto sm:px-8"
            >
              Acompanhar meu pedido
            </button>
            <p className="text-xs text-muted-foreground">
              Você receberá atualizações por WhatsApp e aqui no sistema.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[#25D366] px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-[#1da851]"
            >
              <MessageCircle className="h-4 w-4" />
              Enviar comprovante pelo WhatsApp
            </button>
            <button
              type="button"
              onClick={() => {
                store.reset()
                router.push("/")
              }}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-border px-5 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted"
            >
              Voltar à loja
            </button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Essência & Arte — Transformamos ideias em lembranças únicas.{" "}
            <Heart className="inline h-3 w-3 fill-primary text-primary" />
          </p>
        </div>
      </div>
    )
  }

  // Main confirmation form
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao wizard
        </button>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Confirmação do Pedido
        </h1>
        <p className="mt-1 text-muted-foreground">
          Revise todos os detalhes antes de confirmar
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left: Order details + form */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Order details card */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Detalhes do Pedido
            </h2>

            <div className="mt-4 space-y-4">
              <DetailRow label="Categoria" value={categoryName} />
              <DetailRow label="Modelo" value={modelName} />
              {store.personalization.enabled && (
                <DetailRow
                  label="Nome personalizado"
                  value={`"${store.personalization.name}"`}
                />
              )}
              <Separator />
              <DetailRow
                label="Cor principal"
                value={primaryColor}
                icon={<Palette className="h-4 w-4 text-primary" />}
              />
              {secondaryColor && (
                <DetailRow label="Cor secundária" value={secondaryColor} />
              )}
              {glitterName && (
                <DetailRow
                  label="Glitter"
                  value={glitterName}
                  icon={<Sparkles className="h-4 w-4 text-primary" />}
                />
              )}
              {tasselColor && (
                <DetailRow label="Cor do tassel" value={tasselColor} />
              )}
              {selectedExtras.length > 0 && (
                <>
                  <Separator />
                  <DetailRow
                    label="Adicionais"
                    value={selectedExtras.map((e) => e!.name).join(", ")}
                  />
                </>
              )}
              <Separator />
              <DetailRow
                label="Embalagem"
                value={packagingName}
                icon={<Gift className="h-4 w-4 text-primary" />}
              />
              {store.packaging.type === "gift" && store.packaging.message && (
                <DetailRow
                  label="Mensagem"
                  value={`"${store.packaging.message}"`}
                />
              )}
              <DetailRow
                label="Entrega"
                value={shippingName}
                icon={<Truck className="h-4 w-4 text-primary" />}
              />
            </div>
          </div>

          {/* Customer form */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <User className="h-5 w-5 text-primary" />
              Seus Dados
            </h2>

            <div className="mt-4 space-y-4">
              <FormField
                id="name"
                label="Nome completo"
                icon={<User className="h-4 w-4" />}
                required
                value={customerData.name}
                onChange={(v) => setCustomerData((d) => ({ ...d, name: v }))}
                error={errors.name}
                placeholder="Seu nome"
              />
              <FormField
                id="phone"
                label="WhatsApp / Telefone"
                icon={<Phone className="h-4 w-4" />}
                required
                value={customerData.phone}
                onChange={(v) =>
                  setCustomerData((d) => ({
                    ...d,
                    phone: v.replace(/\D/g, "").slice(0, 11),
                  }))
                }
                error={errors.phone}
                placeholder="(11) 99999-9999"
              />
              <FormField
                id="email"
                label="E-mail (opcional)"
                icon={<Mail className="h-4 w-4" />}
                value={customerData.email}
                onChange={(v) => setCustomerData((d) => ({ ...d, email: v }))}
                error={errors.email}
                placeholder="seu@email.com"
              />
              <div className="space-y-2">
                <label
                  htmlFor="notes"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Observações (opcional)
                </label>
                <textarea
                  id="notes"
                  value={customerData.notes}
                  onChange={(e) =>
                    setCustomerData((d) => ({ ...d, notes: e.target.value }))
                  }
                  placeholder="Alguma instrução especial?"
                  rows={3}
                  className="flex w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Forma de pagamento */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Banknote className="h-5 w-5 text-primary" />
              Forma de pagamento
            </h2>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("pix")}
                className={cn(
                  "flex items-center gap-2 rounded-[var(--radius-lg)] border-2 px-4 py-3 transition-all",
                  paymentMethod === "pix"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <QrCode className={cn("h-5 w-5", paymentMethod === "pix" ? "text-primary" : "text-muted-foreground")} />
                <span className="text-sm font-semibold text-foreground">Pix</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={cn(
                  "flex items-center gap-2 rounded-[var(--radius-lg)] border-2 px-4 py-3 transition-all",
                  paymentMethod === "transfer"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                )}
              >
                <Banknote className={cn("h-5 w-5", paymentMethod === "transfer" ? "text-primary" : "text-muted-foreground")} />
                <span className="text-sm font-semibold text-foreground">Transferência</span>
              </button>
            </div>

            <div className="mt-4 rounded-[var(--radius-lg)] bg-primary/5 p-4">
              {paymentMethod === "pix" ? (
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <div className="rounded-[var(--radius-md)] border border-border bg-white p-2">
                      <QRCode value={pixPayload} size={120} level="M" bgColor="#ffffff" fgColor="#000000" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Escaneie no app bancário</p>
                  </div>
                  <div className="flex-1 space-y-2 self-center">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Entrada (50%)</span>
                      <span className="text-lg font-bold text-primary">{formatBRL(pricing.deposit)}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Chave Pix</p>
                    <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-card px-3 py-2 border border-border">
                      <code className="text-xs font-medium text-foreground break-all">{pixKey}</code>
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="ml-2 shrink-0 rounded-[var(--radius-sm)] p-1 text-muted-foreground hover:text-foreground"
                        title="Copiar"
                      >
                        {pixCopied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Entrada (50%)</span>
                    <span className="text-lg font-bold text-primary">{formatBRL(pricing.deposit)}</span>
                  </div>
                  <Separator />
                  <p className="text-xs text-muted-foreground">Dados para transferência:</p>
                  <ul className="space-y-1 text-xs text-foreground">
                    <li><span className="text-muted-foreground">Banco:</span> a definir</li>
                    <li><span className="text-muted-foreground">Agência:</span> 0001</li>
                    <li><span className="text-muted-foreground">Conta:</span> 12345-6</li>
                    <li><span className="text-muted-foreground">Titular:</span> Essência & Arte</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Upload comprovante */}
            <div className="mt-4">
              <label
                htmlFor="proof"
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed px-4 py-3 text-sm font-medium transition-all",
                  proofFile ? "border-success bg-success/5 text-success" : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <Upload className="h-4 w-4" />
                {proofFile ? proofFile.name : "Enviar comprovante (após pagamento)"}
                <input
                  id="proof"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                Após o pagamento, envie o comprovante. PDF ou imagem.
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-warning/10 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Confira tudo antes de confirmar
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Após a confirmação, alterações podem ser feitas pelo WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Price summary + CTA */}
        <div className="w-full shrink-0 lg:w-80">
          <div className="sticky top-20 space-y-4">
            {/* Price card */}
            <div className="rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
              <h3 className="font-display text-lg font-semibold text-foreground">
                Resumo do valor
              </h3>
              <div className="mt-4 space-y-2">
                {pricing.breakdown.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">
                      {item.value > 0 ? formatBRL(item.value) : "Incluso"}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatBRL(pricing.total)}
                </span>
              </div>
              <div className="mt-3 rounded-[var(--radius-md)] bg-primary/5 px-3 py-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Entrada (50%)</span>
                  <span className="font-semibold text-primary">
                    {formatBRL(pricing.deposit)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Restante na entrega
                  </span>
                  <span className="font-medium">
                    {formatBRL(pricing.balance)}
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addedToCart}
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-soft transition-all duration-200 hover:bg-primary-hover hover:shadow-card active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {addedToCart ? (
                <>
                  <Check className="h-5 w-5" />
                  Adicionado!
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Adicionar à sacola
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || addedToCart}
              className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-border px-6 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Confirmar agora
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-muted-foreground">
              Feito com{" "}
              <Heart className="inline h-2.5 w-2.5 text-primary" /> por
              Essência & Arte
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===== Sub-components ===== */

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}

function FormField({
  id,
  label,
  icon,
  required,
  value,
  onChange,
  error,
  placeholder,
}: {
  id: string
  label: string
  icon: React.ReactNode
  required?: boolean
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium text-foreground"
      >
        <span className="text-muted-foreground">{icon}</span>
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius-md)] border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          error ? "border-destructive" : "border-input"
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
