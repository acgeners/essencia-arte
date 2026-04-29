"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  Heart,
  ShoppingBag,
  MessageCircle,
  Package,
  ChevronRight,
  LogOut,
  User,
  Lock,
  MapPin,
  Pencil,
  Trash2,
  Star,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  updateProfile,
  updatePassword,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/app/(public)/minha-conta/actions"

interface UserInfo {
  name: string
  email: string
  initials: string
}

type CustomerAddress = {
  id: string
  label: string | null
  zip_code: string
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
  is_default: boolean
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("")
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511999999999"

type Tab = "conta" | "perfil" | "enderecos"

export function MinhaContaContent() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("conta")
  const { items, openCart } = useCartStore()
  const cartCount = items.length

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (u) {
        const name =
          (u.user_metadata?.full_name as string | undefined) ??
          u.email?.split("@")[0] ??
          "Usuário"
        setUser({ name, email: u.email ?? "", initials: getInitials(name) })
      }
      setLoading(false)
    })
  }, [])

  function refreshUserName(name: string) {
    setUser((prev) => prev ? { ...prev, name, initials: getInitials(name) } : prev)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Profile header */}
        <div className="mb-6 flex items-center gap-5 rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
          {loading ? (
            <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-soft">
                {user.initials}
              </div>
              <div className="min-w-0">
                <p className="font-display text-xl font-semibold text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted text-2xl">
                👤
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-foreground">
                  Olá, visitante!
                </p>
                <p className="text-sm text-muted-foreground">
                  Faça um pedido para criar sua conta automaticamente.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        {user && (
          <div className="mb-6 flex gap-1 rounded-[var(--radius-lg)] border border-border bg-card p-1">
            {(["conta", "perfil", "enderecos"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-all",
                  tab === t
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "conta" && "Minha Conta"}
                {t === "perfil" && "Meu Perfil"}
                {t === "enderecos" && "Endereços"}
              </button>
            ))}
          </div>
        )}

        {/* Tab: Conta */}
        {tab === "conta" && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <AccountCard
                href="/pedido/acompanhar"
                icon={<Search className="h-6 w-6" />}
                title="Acompanhar Pedido"
                desc="Consulte o status pelo código ou telefone"
                color="bg-blue-50 text-blue-600"
              />

              <AccountCard
                href="/pedido/novo"
                icon={<Plus className="h-6 w-6" />}
                title="Novo Pedido"
                desc="Crie uma peça personalizada com suas cores e nome"
                color="bg-primary/10 text-primary"
              />

              <AccountCard
                href="/favoritos"
                icon={<Heart className="h-6 w-6" />}
                title="Meus Favoritos"
                desc="Produtos salvos para personalizar depois"
                color="bg-rose-50 text-rose-500"
              />

              <button
                type="button"
                onClick={openCart}
                className="group flex items-center gap-4 rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-soft transition-all hover:border-primary/30 hover:shadow-card text-left"
              >
                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)]", "bg-amber-50 text-amber-600")}>
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-semibold text-foreground">
                      Minha Sacola
                    </p>
                    {cartCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {cartCount > 0
                      ? `${cartCount} ${cartCount === 1 ? "item" : "itens"} aguardando`
                      : "Sua sacola de compras"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-soft transition-all hover:border-primary/30 hover:shadow-card"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-emerald-50 text-emerald-600">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold text-foreground">
                    Fale Conosco
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Atendimento pelo WhatsApp
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </a>

              <AccountCard
                href="/pedido/novo"
                icon={<Package className="h-6 w-6" />}
                title="Como Funciona"
                desc="Entenda o processo de personalização e entrega"
                color="bg-purple-50 text-purple-600"
              />
            </div>

            <div className="mt-6 rounded-[var(--radius-xl)] border border-border bg-card p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dica</p>
              <h3 className="mt-1 font-display text-base font-semibold text-foreground">
                Como acompanhar seus pedidos?
              </h3>
              <ol className="mt-4 space-y-2.5">
                {[
                  'Acesse "Acompanhar Pedido" acima',
                  "Digite o código do pedido ou seu número de telefone",
                  "Veja o status atualizado em tempo real",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">
                Você também recebe atualizações pelo WhatsApp assim que o status mudar.
              </p>
            </div>

            {user && (
              <div className="mt-6 text-center">
                <SignOutButton />
              </div>
            )}
          </>
        )}

        {/* Tab: Perfil */}
        {tab === "perfil" && user && (
          <ProfileTab user={user} onNameUpdated={refreshUserName} />
        )}

        {/* Tab: Endereços */}
        {tab === "enderecos" && user && (
          <AddressesTab />
        )}
      </div>
    </div>
  )
}

/* ===== Profile Tab ===== */

function ProfileTab({
  user,
  onNameUpdated,
}: {
  user: UserInfo
  onNameUpdated: (name: string) => void
}) {
  const [nameOpen, setNameOpen] = useState(false)
  const [passOpen, setPassOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Update name */}
      <div className="rounded-[var(--radius-xl)] border border-border bg-card shadow-soft overflow-hidden">
        <button
          type="button"
          onClick={() => setNameOpen((v) => !v)}
          className="flex w-full items-center gap-4 p-5 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-display text-base font-semibold text-foreground">Alterar nome</p>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>
          {nameOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {nameOpen && (
          <div className="border-t border-border px-5 pb-5 pt-4">
            <NameForm currentName={user.name} onSuccess={(name) => { onNameUpdated(name); setNameOpen(false) }} />
          </div>
        )}
      </div>

      {/* Update password */}
      <div className="rounded-[var(--radius-xl)] border border-border bg-card shadow-soft overflow-hidden">
        <button
          type="button"
          onClick={() => setPassOpen((v) => !v)}
          className="flex w-full items-center gap-4 p-5 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-amber-50 text-amber-600">
            <Lock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-display text-base font-semibold text-foreground">Alterar senha</p>
            <p className="text-sm text-muted-foreground">Mantenha sua conta segura</p>
          </div>
          {passOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {passOpen && (
          <div className="border-t border-border px-5 pb-5 pt-4">
            <PasswordForm onSuccess={() => setPassOpen(false)} />
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <SignOutButton />
      </div>
    </div>
  )
}

function NameForm({ currentName, onSuccess }: { currentName: string; onSuccess: (name: string) => void }) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(currentName)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Nome atualizado!")
        onSuccess(name)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Nome completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  )
}

function PasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Senha alterada com sucesso!")
        ;(e.target as HTMLFormElement).reset()
        onSuccess()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { id: "current_password", label: "Senha atual" },
        { id: "new_password", label: "Nova senha" },
        { id: "confirm_password", label: "Confirmar nova senha" },
      ].map(({ id, label }) => (
        <div key={id}>
          <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
          <input
            id={id}
            name={id}
            type="password"
            required
            minLength={id !== "current_password" ? 6 : undefined}
            className="flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      ))}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? "Alterando..." : "Alterar senha"}
        </button>
      </div>
    </form>
  )
}

/* ===== Addresses Tab ===== */

function AddressesTab() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CustomerAddress | null>(null)

  async function load() {
    setLoading(true)
    const data = await getAddresses()
    setAddresses(data as CustomerAddress[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm("Remover este endereço?")) return
    const result = await deleteAddress(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Endereço removido.")
      load()
    }
  }

  async function handleSetDefault(id: string) {
    const result = await setDefaultAddress(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Endereço padrão definido.")
      load()
    }
  }

  function handleEdit(address: CustomerAddress) {
    setEditing(address)
    setFormOpen(true)
  }

  function handleAddNew() {
    setEditing(null)
    setFormOpen(true)
  }

  function handleFormClose() {
    setFormOpen(false)
    setEditing(null)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-foreground">Meus Endereços</h2>
        <button
          type="button"
          onClick={handleAddNew}
          className="flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Novo endereço
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-[var(--radius-xl)] bg-muted" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-border bg-card p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <MapPin className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                "rounded-[var(--radius-xl)] border bg-card p-5 shadow-soft",
                addr.is_default ? "border-primary/40" : "border-border"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {addr.label && (
                        <span className="font-display text-sm font-semibold text-foreground">
                          {addr.label}
                        </span>
                      )}
                      {addr.is_default && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          <Star className="h-2.5 w-2.5" /> Padrão
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-foreground">
                      {addr.street}, {addr.number}
                      {addr.complement ? `, ${addr.complement}` : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {addr.district} — {addr.city}/{addr.state}
                    </p>
                    <p className="text-xs text-muted-foreground">CEP: {addr.zip_code}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!addr.is_default && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      title="Definir como padrão"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleEdit(addr)}
                    title="Editar"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    title="Remover"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <AddressFormModal address={editing} onClose={handleFormClose} />
      )}
    </div>
  )
}

function AddressFormModal({
  address,
  onClose,
}: {
  address: CustomerAddress | null
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [zipCode, setZipCode] = useState(address?.zip_code ?? "")
  const [street, setStreet] = useState(address?.street ?? "")
  const [district, setDistrict] = useState(address?.district ?? "")
  const [city, setCity] = useState(address?.city ?? "")
  const [state, setState] = useState(address?.state ?? "")
  const [loadingCep, setLoadingCep] = useState(false)

  async function handleCepBlur(cep: string) {
    const clean = cep.replace(/\D/g, "")
    if (clean.length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setStreet(data.logradouro || "")
        setDistrict(data.bairro || "")
        setCity(data.localidade || "")
        setState(data.uf || "")
      }
    } catch {
      // silent
    } finally {
      setLoadingCep(false)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = address
        ? await updateAddress(address.id, formData)
        : await createAddress(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(address ? "Endereço atualizado!" : "Endereço adicionado!")
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center p-4">
      <div className="w-full max-w-lg rounded-[var(--radius-xl)] bg-card border border-border shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {address ? "Editar endereço" : "Novo endereço"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <FormField label="Apelido (ex: Casa, Trabalho)" id="label" name="label" defaultValue={address?.label ?? ""} placeholder="Opcional" />

          <div>
            <label htmlFor="zip_code" className="block text-sm font-medium text-foreground mb-1">
              CEP <span className="text-destructive">*</span>
            </label>
            <input
              id="zip_code"
              name="zip_code"
              type="text"
              required
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              onBlur={(e) => handleCepBlur(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              className="flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {loadingCep && <p className="mt-1 text-xs text-muted-foreground">Buscando CEP...</p>}
          </div>

          <div>
            <label htmlFor="street" className="block text-sm font-medium text-foreground mb-1">
              Rua / Logradouro <span className="text-destructive">*</span>
            </label>
            <input
              id="street"
              name="street"
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Nome da rua"
              className="flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Número" id="number" name="number" defaultValue={address?.number ?? ""} placeholder="123" required />
            <FormField label="Complemento" id="complement" name="complement" defaultValue={address?.complement ?? ""} placeholder="Apto, bloco..." />
          </div>

          <div>
            <label htmlFor="district" className="block text-sm font-medium text-foreground mb-1">
              Bairro <span className="text-destructive">*</span>
            </label>
            <input
              id="district"
              name="district"
              type="text"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Bairro"
              className="flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">
                Cidade <span className="text-destructive">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cidade"
                className="flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-foreground mb-1">
                Estado <span className="text-destructive">*</span>
              </label>
              <input
                id="state"
                name="state"
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="SP"
                maxLength={2}
                className="flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="is_default"
              name="is_default"
              type="checkbox"
              value="true"
              defaultChecked={address?.is_default ?? false}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <label htmlFor="is_default" className="text-sm text-foreground">
              Definir como endereço padrão
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormField({
  label,
  id,
  name,
  defaultValue,
  placeholder,
  required,
}: {
  label: string
  id: string
  name: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  )
}

/* ===== Shared sub-components ===== */

function AccountCard({
  href,
  icon,
  title,
  desc,
  color,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
  color: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-[var(--radius-xl)] border border-border bg-card p-5 shadow-soft transition-all hover:border-primary/30 hover:shadow-card"
    >
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)]", color)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-base font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

function SignOutButton() {
  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-destructive"
    >
      <LogOut className="h-4 w-4" />
      Sair da conta
    </button>
  )
}
