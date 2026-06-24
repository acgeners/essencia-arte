import { Heart } from "lucide-react"
import Link from "next/link"

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511999999999"

const footerLinks = {
  loja: [
    { label: "Produtos", href: "/", external: false },
    { label: "Como funciona", href: "/#como-funciona", external: false },
    { label: "Acompanhar pedido", href: "/pedido/acompanhar", external: false },
  ],
  atendimento: [
    { label: "Fale no WhatsApp", href: `https://wa.me/${WHATSAPP_NUMBER}`, external: true },
    { label: "Minha conta", href: "/minha-conta", external: false },
  ],
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Essência & Arte
              </h2>
            </Link>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Transformamos ideias em lembranças únicas. Cada detalhe, feito com
              amor.{" "}
              <Heart className="inline-block h-3 w-3 text-primary" />
            </p>
          </div>

          {/* Links da Loja */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Loja</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.loja.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Atendimento
            </h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.atendimento.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-6 text-center">
          <p className="font-display text-sm text-muted-foreground">
            Essência & Arte — Transformamos ideias em lembranças únicas.{" "}
            <Heart className="inline-block h-3 w-3 text-primary" />
          </p>
          <p className="text-xs text-muted-foreground">
            © {currentYear} Essência & Arte. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
