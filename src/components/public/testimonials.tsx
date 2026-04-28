import { Star, Quote } from "lucide-react"

interface Testimonial {
  name: string
  location: string
  product: string
  rating: number
  text: string
  date: string
}

const testimonials: Testimonial[] = [
  {
    name: "Ana Carolina",
    location: "São Paulo, SP",
    product: "Caneta personalizada",
    rating: 5,
    text: "Encomendei uma caneta com o nome da minha filha para o aniversário dela. Chegou num prazo incrível, embalada com muito cuidado. A personalização ficou perfeita — ela amou! Com certeza vou pedir mais.",
    date: "março de 2025",
  },
  {
    name: "Beatriz Mendes",
    location: "Belo Horizonte, MG",
    product: "Porta-alianças artesanal",
    rating: 5,
    text: "Pedi um porta-alianças para o meu casamento e ficou melhor do que eu imaginei. As cores combinaram exatamente com a decoração. Recebi elogios de todos os convidados. Vale muito cada centavo.",
    date: "janeiro de 2025",
  },
  {
    name: "Fernanda Costa",
    location: "Curitiba, PR",
    product: "Chaveiro personalizado",
    rating: 5,
    text: "Presentei minha mãe com um chaveiro no Dia das Mães e ela ficou emocionada. O acabamento é impecável, dá pra sentir o capricho em cada detalhe. Atendimento pelo WhatsApp foi rápido e atencioso.",
    date: "maio de 2025",
  },
  {
    name: "Juliana Ramos",
    location: "Rio de Janeiro, RJ",
    product: "Kit lembrança personalizado",
    rating: 5,
    text: "Encomendei 15 kits de lembrança para o chá de bebê. A loja foi super atenciosa, ajudou a escolher as cores e manteve tudo dentro do prazo. As convidadas ficaram encantadas. Recomendo demais!",
    date: "fevereiro de 2025",
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "h-4 w-4 fill-amber-400 text-amber-400"
              : "h-4 w-4 text-muted-foreground/30"
          }
        />
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="bg-muted/20 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Depoimentos
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            O que nossos clientes dizem
          </h2>
          <p className="mt-3 text-muted-foreground">
            Cada peça carrega uma história. Veja o que quem já comprou tem a contar.
          </p>
        </div>

        {/* Cards — horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="relative flex min-w-[280px] flex-col rounded-[var(--radius-xl)] border border-border bg-card p-6 shadow-soft sm:min-w-0"
            >
              {/* Quote icon */}
              <Quote className="mb-3 h-6 w-6 shrink-0 text-primary/20" />

              {/* Review text */}
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                "{t.text}"
              </p>

              {/* Divider */}
              <div className="my-5 h-px bg-border" />

              {/* Footer */}
              <div className="space-y-1.5">
                <StarRating rating={t.rating} />
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-primary/70">
                  {t.product} · {t.date}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Aggregate note */}
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span>
            <strong className="text-foreground">5,0</strong> de 5 — baseado em avaliações de clientes reais
          </span>
        </div>
      </div>
    </section>
  )
}
