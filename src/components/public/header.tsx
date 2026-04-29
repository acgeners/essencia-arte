"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Menu,
  X,
  ShoppingBag,
  Search,
  User,
  Heart,
  ChevronDown,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/stores/cart-store"
import { createClient } from "@/lib/supabase/client"

const EMOJI: Record<string, string> = {
  canetas: "✒️",
  chaveiros: "🗝️",
  "porta-aliancas": "💍",
  lembrancas: "🎁",
  outros: "✨",
}

const DESC: Record<string, string> = {
  canetas: "Personalizadas com glitter e nome",
  chaveiros: "Artesanais em resina colorida",
  "porta-aliancas": "Perfeitos para casamentos",
  lembrancas: "Kits e presentes especiais",
  outros: "Peças exclusivas e artesanais",
}

interface NavCategory {
  id: string
  slug: string
  name: string
}

export function Header({ categories }: { categories: NavCategory[] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBestsellerOpen, setIsBestsellerOpen] = useState(false)
  const [firstName, setFirstName] = useState<string | null>(null)
  const { items, openCart } = useCartStore()
  const cartCount = items.length
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const fullName = data.user?.user_metadata?.full_name as string | undefined
      setFirstName(fullName?.split(" ")[0] ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const fullName = session?.user?.user_metadata?.full_name as string | undefined
      setFirstName(fullName?.split(" ")[0] ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsBestsellerOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-[#2A1810] py-1.5 text-center text-[10px] font-bold uppercase tracking-widest text-primary-foreground sm:text-xs">
        <p>Frete Grátis em pedidos acima de R$ 199,90 • Parcelamento em até 3x sem juros</p>
      </div>

      <header className="border-b border-border bg-card/95 backdrop-blur-md">
        {/* Main Header */}
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img
              src="/logo.png"
              alt="Essência & Arte"
              className="h-16 w-auto object-contain sm:h-20"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.parentElement?.querySelector(".logo-text")?.classList.remove("hidden")
              }}
            />
            <span className="logo-text hidden font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              ESSÊNCIA <span className="text-primary">&</span> ARTE
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="mx-8 hidden max-w-md flex-1 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="O que você está procurando?"
                className="h-10 w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 text-sm transition-all focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/minha-conta"
              className="hidden flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 transition-colors hover:bg-muted md:flex text-muted-foreground hover:text-foreground"
              title="Minha Conta"
            >
              <User className="h-5 w-5" />
              {firstName && (
                <span className="text-[10px] font-medium leading-none">{firstName}</span>
              )}
            </Link>
            <Link
              href="/favoritos"
              className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted md:flex text-muted-foreground hover:text-foreground"
              title="Favoritos"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
              title="Minha Sacola"
            >
              <ShoppingBag className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Nav - Desktop */}
        <div className="hidden border-t border-border md:block">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 h-12 px-4 sm:px-6 lg:px-8">

            {/* Mais Vendidos — dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsBestsellerOpen((o) => !o)}
                className={cn(
                  "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest transition-all hover:text-primary",
                  isBestsellerOpen ? "text-primary" : "text-muted-foreground"
                )}
              >
                Mais Vendidos
                <ChevronDown
                  className={cn("h-3 w-3 transition-transform duration-200", isBestsellerOpen && "rotate-180")}
                />
              </button>

              {isBestsellerOpen && (
                <div className="absolute left-1/2 top-full mt-3 w-80 -translate-x-1/2 rounded-[var(--radius-xl)] border border-border bg-card shadow-card">
                  {/* Arrow */}
                  <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-border bg-card" />

                  <div className="p-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Nossas Coleções
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/#${cat.slug}`}
                          onClick={() => setIsBestsellerOpen(false)}
                          className="group flex items-start gap-3 rounded-[var(--radius-lg)] p-3 transition-colors hover:bg-muted"
                        >
                          <span className="mt-0.5 text-xl leading-none">
                            {EMOJI[cat.slug] ?? "✨"}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                              {cat.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {DESC[cat.slug] ?? "Peças exclusivas artesanais"}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-3 border-t border-border pt-3">
                      <Link
                        href="/"
                        onClick={() => setIsBestsellerOpen(false)}
                        className="flex items-center justify-center gap-1.5 rounded-[var(--radius-lg)] bg-primary/8 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                      >
                        Ver todas as coleções
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Categorias normais */}
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/#${cat.slug}`}
                className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground transition-all hover:text-primary"
              >
                {cat.name}
              </Link>
            ))}

            {/* Outlet */}
            <Link
              href="/pedido/novo"
              className="text-[11px] font-semibold uppercase tracking-widest text-red-500 transition-all hover:text-red-400"
            >
              Outlet
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[calc(16px+96px+48px)] z-50 bg-background md:hidden overflow-y-auto">
          <div className="px-4 py-6 space-y-8">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="O que você está procurando?"
                className="h-12 w-full rounded-lg border border-border bg-muted/50 pl-10 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Mobile Categories */}
            <div className="space-y-1">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Coleções</p>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/#${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-3 transition-colors hover:bg-muted"
                >
                  <span className="text-xl">{EMOJI[cat.slug] ?? "✨"}</span>
                  <div>
                    <p className="text-base font-semibold text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {DESC[cat.slug] ?? "Peças exclusivas artesanais"}
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                href="/pedido/novo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] px-3 py-3 transition-colors hover:bg-muted"
              >
                <span className="text-xl">🏷️</span>
                <p className="text-base font-semibold text-red-500">Outlet</p>
              </Link>
            </div>

            <div className="border-t border-border pt-6 flex flex-col gap-4">
              <Link
                href="/minha-conta"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-base font-medium text-foreground"
              >
                <User className="h-5 w-5 text-muted-foreground" />
                Minha Conta
              </Link>
              <Link
                href="/favoritos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-base font-medium text-foreground"
              >
                <Heart className="h-5 w-5 text-muted-foreground" />
                Meus Favoritos
              </Link>
              <Link
                href="/pedido/acompanhar"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-base font-medium text-foreground"
              >
                <Search className="h-5 w-5 text-muted-foreground" />
                Acompanhar Pedido
              </Link>
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); openCart() }}
                className="flex items-center gap-3 text-base font-medium text-foreground"
              >
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                Minha Sacola
                {cartCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
