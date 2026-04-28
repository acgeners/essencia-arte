"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingBag } from "lucide-react"

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Produtos", href: "/produtos" },
  { label: "Fale Conosco", href: "/contato" },
]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-semibold text-foreground sm:text-2xl">
            Essência{" "}
            <span className="text-primary">&</span>{" "}
            Arte
          </span>
        </Link>

        {/* Nav Desktop */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/pedido/novo"
            className="hidden items-center gap-2 rounded-[--radius-lg] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary-hover active:scale-[0.98] sm:inline-flex"
          >
            <ShoppingBag className="h-4 w-4" />
            Fazer Pedido
          </Link>

          <Link
            href="/pedido/acompanhar"
            className="hidden text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground md:inline-block"
          >
            Meu Pedido
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-[--radius-md] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border bg-card md:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-4" aria-label="Menu mobile">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-[--radius-md] px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/pedido/acompanhar"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-[--radius-md] px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Meu Pedido
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/pedido/novo"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-[--radius-lg] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary-hover"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Fazer Pedido
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
