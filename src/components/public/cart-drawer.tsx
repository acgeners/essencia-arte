"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import QRCode from "react-qr-code"
import { useCartStore, type CartItem } from "@/stores/cart-store"
import { createOrderAction } from "@/app/(public)/pedido/confirmacao/actions"
import { generatePixPayload } from "@/lib/pix"
import { formatBRL } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

type View = "items" | "checkout" | "payment"

interface CustomerData {
  name: string
  phone: string
  email: string
  notes: string
}

export function CartDrawer() {
  const router = useRouter()
  const { items, isOpen, closeCart, removeItem, clearCart } = useCartStore()
  const [view, setView] = useState<View>("items")
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pixCopied, setPixCopied] = useState(false)

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
  }, [isOpen])

  const totalPrice = items.reduce((sum, i) => sum + i.totalPrice, 0)
  const totalDeposit = items.reduce((sum, i) => sum + i.depositAmount, 0)

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
    setSubmitError(null)

    for (const item of items) {
      const res = await createOrderAction(item.wizardState, customerData)
      if (!res.success) {
        setSubmitError(res.error ?? "Erro ao processar um dos itens.")
        setIsSubmitting(false)
        return
      }
    }

    setIsSubmitting(false)
    setView("payment")
  }

  const pixKey =
    process.env.NEXT_PUBLIC_PIX_KEY ?? "email@essenciaearte.com.br"

  const pixPayload = useMemo(
    () =>
      generatePixPayload({
        key: pixKey,
        merchantName: "Essencia e Arte",
        merchantCity: "SAO PAULO",
        amount: totalDeposit,
        description: "Entrada pedidos EA",
      }),
    [pixKey, totalDeposit]
  )

  function handleCopyPix() {
    navigator.clipboard.writeText(pixKey).then(() => {
      setPixCopied(true)
      setTimeout(() => setPixCopied(false), 2000)
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

  const viewTitle: Record<View, string> = {
    items: "Minha Sacola",
    checkout: "Fechar Pedido",
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
                  onRemove={removeItem}
                  onCheckout={() => setView("checkout")}
                  onClose={closeCart}
                  onCustomize={handleCustomize}
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
                  submitError={submitError}
                  onSubmit={handleSubmit}
                />
              )}
              {view === "payment" && (
                <PaymentView
                  totalDeposit={totalDeposit}
                  pixPayload={pixPayload}
                  pixKey={pixKey}
                  pixCopied={pixCopied}
                  onCopyPix={handleCopyPix}
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
  onRemove,
  onCheckout,
  onClose,
  onCustomize,
}: {
  items: CartItem[]
  totalPrice: number
  totalDeposit: number
  onRemove: (id: string) => void
  onCheckout: () => void
  onClose: () => void
  onCustomize: () => void
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
          <li key={item.id} className="flex items-start gap-4 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {item.displayName}
              </p>
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
          Fechar Pedido
        </button>
        <button
          type="button"
          onClick={onClose}
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
            rows={3}
            className="flex w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
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
  pixKey,
  pixCopied,
  onCopyPix,
  onWhatsApp,
  onFinish,
}: {
  totalDeposit: number
  pixPayload: string
  pixKey: string
  pixCopied: boolean
  onCopyPix: () => void
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
          Pedido(s) enviado(s)!
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Em breve entraremos em contato pelo WhatsApp.
        </p>
      </div>

      <Separator />

      {/* PIX payment */}
      <div className="rounded-[var(--radius-lg)] bg-primary/5 p-5">
        <p className="text-sm font-semibold text-foreground">
          📱 Próximo passo: pague a entrada via Pix
        </p>

        <div className="mt-4 flex flex-col items-center gap-4">
          <div className="rounded-[var(--radius-lg)] border border-border bg-white p-3 shadow-soft">
            <QRCode
              value={pixPayload}
              size={150}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Escaneie com seu app bancário
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Valor da entrada (50%)</span>
            <span className="text-lg font-bold text-primary">
              {formatBRL(totalDeposit)}
            </span>
          </div>
          <Separator />
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ou copie a chave Pix
            </p>
            <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-border bg-card px-3 py-2.5">
              <code className="break-all text-sm font-medium text-foreground">
                {pixKey}
              </code>
              <button
                type="button"
                onClick={onCopyPix}
                className="ml-2 shrink-0 rounded-[var(--radius-sm)] p-1 text-muted-foreground hover:text-foreground"
                title="Copiar chave Pix"
              >
                {pixCopied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            {pixCopied && (
              <p className="mt-1 text-xs text-success">Chave copiada!</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onWhatsApp}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-[#25D366] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1da851]"
        >
          <MessageCircle className="h-4 w-4" />
          Enviar comprovante pelo WhatsApp
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
