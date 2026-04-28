"use client"

import Link from "next/link"
import { 
  Pen, 
  KeyRound, 
  Sparkles,
  ShoppingBag,
  Flame,
  Zap
} from "lucide-react"

const quickLinks = [
  { label: "Tote Bags", icon: ShoppingBag, href: "/pedido/novo" },
  { label: "Canetas", icon: Pen, href: "/pedido/novo?category=canetas" },
  { label: "Chaveiros", icon: KeyRound, href: "/pedido/novo?category=chaveiros" },
  { label: "Bolsas", icon: ShoppingBag, href: "/pedido/novo" },
  { label: "Mochilas", icon: ShoppingBag, href: "/pedido/novo" },
  { label: "Copos", icon: Zap, href: "/pedido/novo" },
  { label: "Outlet", icon: Flame, href: "/pedido/novo", color: "text-red-500" },
  { label: "Pet", icon: Sparkles, href: "/pedido/novo" },
]

export function CategoryQuickNav() {
  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4 no-scrollbar">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex flex-col items-center gap-2 group min-w-[80px]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10 group-hover:shadow-lg border border-border">
                <link.icon className={`h-8 w-8 text-muted-foreground group-hover:text-primary ${link.color}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground transition-colors group-hover:text-foreground text-center">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
