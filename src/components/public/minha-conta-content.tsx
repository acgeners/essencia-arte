"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"

interface UserInfo {
  name: string
  email: string
  initials: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("")
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511999999999"

export function MinhaContaContent() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Profile header */}
        <div className="mb-8 flex items-center gap-5 rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft">
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

        {/* Feature grid */}
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

          {/* Sacola — abre o drawer */}
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

        {/* How to track orders */}
        <div className="mt-6 rounded-[var(--radius-xl)] border border-border bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Dica
          </p>
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

        {/* Sign out — only shown when logged in */}
        {user && (
          <div className="mt-6 text-center">
            <SignOutButton />
          </div>
        )}
      </div>
    </div>
  )
}

/* ===== Sub-components ===== */

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
    window.location.reload()
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
