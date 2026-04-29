"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Sliders,
  Warehouse,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Plug,
  LogOut,
  Menu,
  X,
  Store,
} from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarSections = [
  {
    label: "Principal",
    items: [
      { label: "Home", href: "/admin", icon: LayoutDashboard },
      { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingCart },
      { label: "Clientes", href: "/admin/clientes", icon: Users },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { label: "Produtos", href: "/admin/produtos", icon: Package },
      { label: "Categorias", href: "/admin/categorias", icon: Tags },
      { label: "Opções", href: "/admin/opcoes", icon: Sliders },
      { label: "Estoque", href: "/admin/estoque", icon: Warehouse },
    ],
  },
  {
    label: "Gestão",
    items: [
      { label: "Financeiro", href: "/admin/financeiro", icon: DollarSign },
      { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
      { label: "Integrações", href: "/admin/integracoes", icon: Plug },
      { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
    ],
  },
]

function AdminGreeting() {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      if (!u) return
      const fullName = u.user_metadata?.full_name as string | undefined
      setName(fullName?.split(" ")[0] ?? u.email?.split("@")[0] ?? null)
    })
  }, [])

  if (!name) return null

  return (
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Olá,
      </p>
      <p className="truncate text-sm font-semibold text-foreground">{name}</p>
    </div>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  const renderNavContent = () => (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Logo */}
      <div className="shrink-0 flex items-center gap-3 border-b border-sidebar-border px-4 py-3">
        <Link href="/admin" className="flex shrink-0 items-center gap-2">
          <img
            src="/logo.png"
            alt="Essência & Arte"
            className="h-12 w-auto object-contain rounded-md"
            onError={(e) => {
              e.currentTarget.style.display = "none"
              e.currentTarget.parentElement?.querySelector(".logo-text")?.classList.remove("hidden")
            }}
          />
          <span className="logo-text hidden font-display text-lg font-semibold text-foreground">
            Essência <span className="text-primary">&</span> Arte
          </span>
        </Link>
        <AdminGreeting />
      </div>

      {/* Subtitle */}
      <div className="shrink-0 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Painel Admin
        </p>
      </div>

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-2 pb-4" aria-label="Menu administrativo">
        {sidebarSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="shrink-0 border-t border-sidebar-border bg-sidebar p-2 space-y-0.5">
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Store className="h-4 w-4 shrink-0" />
          Ir para loja
        </Link>
        <form action="/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sair
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-card shadow-soft lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-muted-foreground hover:text-foreground"
          aria-label="Fechar menu"
        >
          <X className="h-4 w-4" />
        </button>
        {renderNavContent()}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden h-dvh w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        {renderNavContent()}
      </aside>
    </>
  )
}
