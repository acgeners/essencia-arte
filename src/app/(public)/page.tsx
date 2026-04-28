import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingBag, ArrowRight, Shield, MessageCircle, Truck, Star } from "lucide-react"
import { getFullCatalog } from "@/server/queries/catalog"
import { formatBRL } from "@/lib/format"
import { PromoBanner } from "@/components/public/promo-banner"
import { FavoriteButton } from "@/components/public/favorite-button"
import { Testimonials } from "@/components/public/testimonials"

export default async function HomePage() {
  const catalog = await getFullCatalog()

  const productsByCategory = catalog.categories.map(category => ({
    ...category,
    products: catalog.products.filter(p => p.categorySlug === category.slug)
  })).filter(c => c.products.length > 0)

  return (
    <>
      {/* 1. Banner promocional */}
      <PromoBanner />

      {/* 2. Catálogo de produtos */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {productsByCategory.map((category) => (
            <div key={category.id} id={category.slug} className="mb-16 last:mb-0 scroll-mt-36">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Coleção</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
                    {category.name}
                  </h2>
                </div>
                <Link
                  href={`/pedido/novo?category=${category.slug}`}
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Ver todos <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {category.products.map((product) => (
                  <div key={product.id} className="group flex flex-col">
                    <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-muted">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-16 w-16 text-muted-foreground/15" />
                        </div>
                      )}
                      <FavoriteButton productId={product.id} className="absolute right-2.5 top-2.5" />
                    </div>
                    <div className="mt-3 flex flex-col gap-1 px-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {category.name}
                      </p>
                      <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-base font-bold text-foreground">
                        {formatBRL(product.basePrice)}
                      </p>
                      <Link
                        href="/pedido/novo"
                        className="mt-2 flex h-9 items-center justify-center rounded-full bg-primary text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90"
                      >
                        Personalizar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Como funciona + brand story */}
      <section className="bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 lg:items-start">

            {/* Brand story */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Nossa história</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
                Artesanato com alma,<br />
                <em className="italic text-primary">entregue com carinho.</em>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Somos uma ateliê especializada em peças de resina artesanal, onde cada item é criado à mão com dedicação e atenção a cada detalhe. Acreditamos que um presente personalizado tem um valor sentimental que nenhuma loja de prateleira consegue oferecer.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                De canetas a porta-alianças, tudo começa com a sua ideia e termina em uma peça única que conta a sua história.
              </p>
              <div className="mt-8 flex items-center gap-6">
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-primary">+500</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Clientes</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-primary">100%</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Artesanal</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-primary">5★</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Avaliação</p>
                </div>
              </div>
            </div>

            {/* Como funciona */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Processo</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-foreground sm:text-3xl">
                Como funciona?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">Sua peça exclusiva em 4 etapas simples.</p>

              <div className="mt-8 space-y-6">
                {[
                  { step: "01", icon: "🎨", title: "Escolha", desc: "Selecione o produto e o modelo que mais combina com você." },
                  { step: "02", icon: "✏️", title: "Personalize", desc: "Defina cores, glitter, nome e todos os detalhes." },
                  { step: "03", icon: "💳", title: "Confirme", desc: "Pague 50% de entrada e aguarde a produção artesanal." },
                  { step: "04", icon: "📦", title: "Receba", desc: "Sua peça feita à mão chega com muito carinho." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-border bg-white text-xl shadow-soft">
                      {item.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/50">{item.step}</span>
                        <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
                      </div>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/pedido/novo"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Depoimentos */}
      <Testimonials />

      {/* 5. Trust badges */}
      <section className="border-t border-border py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: Shield, label: "Compra segura", desc: "Dados protegidos" },
              { icon: MessageCircle, label: "WhatsApp", desc: "Sempre disponível" },
              { icon: Truck, label: "Entrega", desc: "Todo o Brasil" },
              { icon: Star, label: "Qualidade", desc: "Artesanal premium" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer CTA */}
      <section className="bg-primary py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <Heart className="mx-auto mb-5 h-8 w-8 text-white/40" />
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            Transformamos ideias em
            <br />
            <em className="italic text-white/80">lembranças únicas.</em>
          </h2>
          <p className="mt-4 text-white/70">Cada detalhe, feito com amor. ❤️</p>
          <Link
            href="/pedido/novo"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-primary shadow-elevated transition-all hover:bg-white/90"
          >
            Criar minha peça agora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
