"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { CartView } from "@/stores/cart-store"
import { AnimatePresence, motion } from "framer-motion"
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowLeft,
  Check,
  Copy,
  MessageCircle,
  User,
  Phone,
  Mail,
  FileText,
  QrCode,
  IdCard,
  Banknote,
} from "lucide-react"
import { useCartStore, type CartItem } from "@/stores/cart-store"
import { useWizardStore } from "@/stores/wizard-store"
import {
  createOrderAction,
  createPixPayload,
  getCartProductImages,
  getCheckoutCustomerData,
} from "@/app/(public)/pedido/confirmacao/actions"
import QRCode from "react-qr-code"
import { formatBRL } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

type View = CartView

interface CustomerData {
  name: string
  phone: string
  email: string
  notes: string
  cpfCnpj: string
}

export function CartDrawer() {
  const router = useRouter()
  const { items, isOpen, view, setView, closeCart, removeItem, clearCart } = useCartStore()
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    phone: "",
    email: "",
    notes: "",
    cpfCnpj: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingCustomerData, setIsLoadingCustomerData] = useState(false)
  const [hasLoadedCustomerData, setHasLoadedCustomerData] = useState(false)
  const [productImages, setProductImages] = useState<Record<string, string | null>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pixPayload, setPixPayload] = useState<string | null>(null)
  const [chargedDeposit, setChargedDeposit] = useState(0)
  const [copied, setCopied] = useState(false)

  // Reset to items view when drawer closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setView("items")
        setErrors({})
        setSubmitError(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen, setView])

  useEffect(() => {
    const missingImageProductIds = items
      .filter((item) => !item.imageSrc && item.wizardState.productId)
      .map((item) => item.wizardState.productId as string)
      .filter((productId) => !(productId in productImages))

    if (missingImageProductIds.length === 0) return

    let isCurrent = true
    getCartProductImages(missingImageProductIds).then((images) => {
      if (!isCurrent) return
      setProductImages((current) => ({ ...current, ...images }))
    })

    return () => {
      isCurrent = false
    }
  }, [items, productImages])

  async function loadCustomerData() {
    if (hasLoadedCustomerData) return
    setIsLoadingCustomerData(true)

    try {
      const savedData = await getCheckoutCustomerData()
      if (savedData) {
        setCustomerData((current) => ({
          ...current,
          name: current.name || savedData.name || "",
          phone: current.phone || savedData.phone || "",
          email: current.email || savedData.email || "",
        }))
      }
    } finally {
      setIsLoadingCustomerData(false)
      setHasLoadedCustomerData(true)
    }
  }

  function handleCheckout() {
    setView("checkout")
    void loadCustomerData()
  }

  const totalPrice = items.reduce((sum, i) => sum + i.totalPrice, 0)
  const totalDeposit = items.reduce((sum, i) => sum + i.depositAmount, 0)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!customerData.name.trim()) newErrors.name = "Nome é obrigatório"
    if (!customerData.phone.trim()) newErrors.phone = "Telefone é obrigatório"
    else if (customerData.phone.replace(/\D/g, "").length < 10)
      newErrors.phone = "Telefone inválido"
    if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email))
      newErrors.email = "E-mail inválido"
    if (customerData.cpfCnpj) {
      const cpf = customerData.cpfCnpj.replace(/\D/g, "")
      if (cpf.length !== 11 && cpf.length !== 14)
        newErrors.cpfCnpj = "CPF (11 dígitos) ou CNPJ (14 dígitos) inválido"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setIsSubmitting(true)
    setSubmitError(null)

    let depositSum = 0
    for (const item of items) {
      const res = await createOrderAction(item.wizardState, customerData)
      if (!res.success) {
        setSubmitError(res.error ?? "Erro ao processar um dos itens.")
        setIsSubmitting(false)
        return
      }
      depositSum += res.deposit ?? 0
    }

    // Um único QR PIX para o total da entrada (valor calculado no servidor)
    const { payload } = await createPixPayload(depositSum)
    setChargedDeposit(depositSum)
    setPixPayload(payload)

    setIsSubmitting(false)
    setView("payment")
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleWhatsApp() {
    const number =
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511999999999"
    const itemLines = items
      .map((i, idx) => `${idx + 1}. ${i.displayName} — ${formatBRL(i.totalPrice)}`)
      .join("\n")
    const msg = encodeURIComponent(
      `Olá! Acabei de fazer pedido(s) no site:\n\n${itemLines}\n\n` +
        `💰 Total: ${formatBRL(totalPrice)}\n` +
        `💳 Entrada: ${formatBRL(totalDeposit)}\n\n` +
        `Nome: ${customerData.name}\nTelefone: ${customerData.phone}`
    )
    window.open(`https://wa.me/${number}?text=${msg}`, "_blank")
  }

  function handleFinish() {
    clearCart()
    closeCart()
  }

  function handleCustomize() {
    closeCart()
    router.push("/pedido/novo")
  }

  function handleContinueShopping() {
    closeCart()
    router.push("/")
  }

  function handleReviewItem(item: CartItem) {
    const current = useWizardStore.getState()
    useWizardStore.setState({
      ...item.wizardState,
      step: 4,
      hasHydrated: current.hasHydrated,
      productDrafts: current.productDrafts,
    })
    closeCart()
    router.push("/pedido/novo?fromCart=1")
  }

  const viewTitle: Record<View, string> = {
    items: "Minha Sacola",
    checkout: "Finalizar Pedido",
    payment: "Pagamento",
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                {view !== "items" && view !== "payment" && (
                  <button
                    type="button"
                    onClick={() => setView("items")}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Voltar"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {viewTitle[view]}
                </h2>
                {view === "items" && items.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({items.length} {items.length === 1 ? "item" : "itens"})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {view === "items" && (
                <ItemsView
                  items={items}
                  totalPrice={totalPrice}
                  totalDeposit={totalDeposit}
                  productImages={productImages}
                  onRemove={removeItem}
                  onCheckout={handleCheckout}
                  onContinueShopping={handleContinueShopping}
                  onCustomize={handleCustomize}
                  onReviewItem={handleReviewItem}
                />
              )}
              {view === "checkout" && (
                <CheckoutView
                  items={items}
                  totalPrice={totalPrice}
                  totalDeposit={totalDeposit}
                  customerData={customerData}
                  setCustomerData={setCustomerData}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  isLoadingCustomerData={isLoadingCustomerData}
                  submitError={submitError}
                  onSubmit={handleSubmit}
                />
              )}
              {view === "payment" && (
                <PaymentView
                  totalDeposit={chargedDeposit}
                  pixPayload={pixPayload}
                  copied={copied}
                  onCopy={handleCopy}
                  onWhatsApp={handleWhatsApp}
                  onFinish={handleFinish}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ===== Sub-views ===== */

function ItemsView({
  items,
  totalPrice,
  totalDeposit,
  productImages,
  onRemove,
  onCheckout,
  onContinueShopping,
  onCustomize,
  onReviewItem,
}: {
  items: CartItem[]
  totalPrice: number
  totalDeposit: number
  productImages: Record<string, string | null>
  onRemove: (id: string) => void
  onCheckout: () => void
  onContinueShopping: () => void
  onCustomize: () => void
  onReviewItem: (item: CartItem) => void
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-foreground">
            Sua sacola está vazia
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Monte um produto personalizado e adicione aqui
          </p>
        </div>
        <button
          type="button"
          onClick={onCustomize}
          className="mt-2 inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover"
        >
          Personalizar agora
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Item list */}
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-4 px-6 py-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-primary/10">
              {(() => {
                const imageSrc =
                  item.imageSrc ??
                  (item.wizardState.productId
                    ? productImages[item.wizardState.productId]
                    : null)

                return imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={item.displayName}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <ShoppingBag className="h-5 w-5 text-primary" />
              )
              })()}
            </div>
            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onReviewItem(item)}
                className="block max-w-full truncate text-left text-sm font-medium text-foreground transition-colors hover:text-primary hover:underline"
              >
                {item.displayName}
              </button>
              <p className="text-xs text-muted-foreground">{item.categoryName}</p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {formatBRL(item.totalPrice)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Remover item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {/* Summary + CTA */}
      <div className="sticky bottom-0 border-t border-border bg-background px-6 py-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">
            {formatBRL(totalPrice)}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-primary/5 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Entrada (50%)</span>
          <span className="font-semibold text-primary">{formatBRL(totalDeposit)}</span>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover active:scale-[0.98]"
        >
          Finalizar Pedido
        </button>
        <button
          type="button"
          onClick={onContinueShopping}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
        >
          Continuar comprando
        </button>
      </div>
    </div>
  )
}

function CheckoutView({
  items,
  totalPrice,
  totalDeposit,
  customerData,
  setCustomerData,
  errors,
  isSubmitting,
  isLoadingCustomerData,
  submitError,
  onSubmit,
}: {
  items: CartItem[]
  totalPrice: number
  totalDeposit: number
  customerData: CustomerData
  setCustomerData: React.Dispatch<React.SetStateAction<CustomerData>>
  errors: Record<string, string>
  isSubmitting: boolean
  isLoadingCustomerData: boolean
  submitError: string | null
  onSubmit: () => void
}) {
  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      {/* Items summary */}
      <div className="rounded-[var(--radius-xl)] border border-border bg-card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Resumo ({items.length} {items.length === 1 ? "item" : "itens"})
        </p>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span className="truncate text-foreground">{item.displayName}</span>
              <span className="ml-2 shrink-0 font-medium text-foreground">
                {formatBRL(item.totalPrice)}
              </span>
            </li>
          ))}
        </ul>
        <Separator className="my-3" />
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatBRL(totalPrice)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between rounded-[var(--radius-md)] bg-primary/5 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Entrada (50%)</span>
          <span className="font-semibold text-primary">{formatBRL(totalDeposit)}</span>
        </div>
      </div>

      {/* Customer form */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Seus dados
        </p>
        {isLoadingCustomerData && (
          <p className="text-xs text-muted-foreground">
            Buscando seus dados salvos...
          </p>
        )}

        <DrawerFormField
          id="cart-name"
          label="Nome completo"
          icon={<User className="h-4 w-4" />}
          required
          value={customerData.name}
          onChange={(v) => setCustomerData((d) => ({ ...d, name: v }))}
          error={errors.name}
          placeholder="Seu nome"
        />
        <DrawerFormField
          id="cart-phone"
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
        <DrawerFormField
          id="cart-email"
          label="E-mail (opcional)"
          icon={<Mail className="h-4 w-4" />}
          value={customerData.email}
          onChange={(v) => setCustomerData((d) => ({ ...d, email: v }))}
          error={errors.email}
          placeholder="seu@email.com"
        />
        <DrawerFormField
          id="cart-cpf"
          label="CPF / CNPJ (opcional)"
          icon={<IdCard className="h-4 w-4" />}
          value={customerData.cpfCnpj}
          onChange={(v) =>
            setCustomerData((d) => ({
              ...d,
              cpfCnpj: v.replace(/\D/g, "").slice(0, 14),
            }))
          }
          error={errors.cpfCnpj}
          placeholder="Somente números"
        />
        <div className="space-y-2">
          <label
            htmlFor="cart-notes"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
            Observações (opcional)
          </label>
          <textarea
            id="cart-notes"
            value={customerData.notes}
            onChange={(e) =>
              setCustomerData((d) => ({ ...d, notes: e.target.value }))
            }
            placeholder="Alguma instrução especial?"
            rows={2}
            className="flex w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Pagamento */}
      <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-border bg-primary/5 px-3 py-2.5">
        <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs text-muted-foreground">
          Pagamento via <span className="font-semibold text-foreground">PIX</span> — o QR Code
          e o copia-e-cola da entrada (50%) aparecem na próxima etapa.
        </p>
      </div>

      {submitError && (
        <p className="rounded-[var(--radius-md)] bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            Enviando...
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Confirmar e pagar
          </>
        )}
      </button>
    </div>
  )
}

function PaymentView({
  totalDeposit,
  pixPayload,
  copied,
  onCopy,
  onWhatsApp,
  onFinish,
}: {
  totalDeposit: number
  pixPayload: string | null
  copied: boolean
  onCopy: (text: string) => void
  onWhatsApp: () => void
  onFinish: () => void
}) {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <Check className="h-7 w-7 text-success" />
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
          Pedido(s) criado(s)!
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Pague a entrada via PIX para confirmar.
        </p>
      </div>

      <Separator />

      {/* Payment info */}
      <div className="rounded-[var(--radius-lg)] bg-primary/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Banknote className="h-4 w-4 text-primary" />
            Entrada total (50%)
          </div>
          <span className="text-lg font-bold text-primary">{formatBRL(totalDeposit)}</span>
        </div>

        {pixPayload ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="rounded-[var(--radius-md)] border border-border bg-white p-3">
                <QRCode value={pixPayload} size={148} />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-card px-3 py-2">
              <code className="flex-1 break-all text-xs font-medium text-foreground line-clamp-2">
                {pixPayload}
              </code>
              <button
                type="button"
                onClick={() => onCopy(pixPayload)}
                className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
                title="Copiar código PIX"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <QrCode className="h-3.5 w-3.5 shrink-0" />
              Escaneie o QR Code ou use o copia-e-cola no app do seu banco.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Combine o pagamento da entrada via WhatsApp e envie o comprovante.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onWhatsApp}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1da851]"
        >
          <MessageCircle className="h-4 w-4" />
          Enviar comprovante no WhatsApp
        </button>
        <button
          type="button"
          onClick={onFinish}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted"
        >
          Voltar à loja
        </button>
      </div>
    </div>
  )
}

/* ===== Form field helper ===== */

function DrawerFormField({
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
