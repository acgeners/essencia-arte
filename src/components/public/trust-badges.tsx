import { Shield, Eye, CreditCard, MessageCircle } from "lucide-react"

const trustItems = [
  {
    icon: Shield,
    title: "Peça com segurança",
    description: "Seus dados protegidos",
  },
  {
    icon: Eye,
    title: "Acompanhamento em tempo real",
    description: "Saiba onde está seu pedido",
  },
  {
    icon: CreditCard,
    title: "Pagamento seguro",
    description: "Pix ou transferência",
  },
  {
    icon: MessageCircle,
    title: "Atendimento pelo WhatsApp",
    description: "Estamos sempre por perto",
  },
]

export function TrustBadges() {
  return (
    <section className="bg-card py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TrustBadgesCompact() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-4 text-xs text-muted-foreground md:gap-8">
      {trustItems.map((item) => (
        <div key={item.title} className="flex items-center gap-2">
          <item.icon className="h-4 w-4 text-primary" />
          <span>{item.title}</span>
        </div>
      ))}
    </div>
  )
}
