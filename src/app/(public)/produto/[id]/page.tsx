import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Clock, Sparkles } from "lucide-react"
import { getFullCatalog } from "@/server/queries/catalog"
import { formatBRL } from "@/lib/format"
import { ProductGallery } from "@/components/public/product-gallery"
import { FavoriteButton } from "@/components/public/favorite-button"
import { ScrollToTop } from "@/components/public/scroll-to-top"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const catalog = await getFullCatalog()
  const product = catalog.products.find((p) => p.id === id)

  if (!product) return { title: "Produto não encontrado" }

  return {
    title: product.name,
    description: `${product.name} — peça artesanal personalizada feita à mão.`,
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params
  const catalog = await getFullCatalog()
  const product = catalog.products.find((p) => p.id === id)

  if (!product) notFound()

  const category = catalog.categories.find((c) => c.slug === product.categorySlug)
  const productionLabel =
    product.productionDaysMin === product.productionDaysMax
      ? `${product.productionDaysMin} ${product.productionDaysMin === 1 ? "dia útil" : "dias úteis"}`
      : `${product.productionDaysMin} a ${product.productionDaysMax} dias úteis`

  const relatedProducts = catalog.products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <ScrollToTop />
      {/* Breadcrumb / back */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/"
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        {category && (
          <>
            <span className="text-muted-foreground/50">/</span>
            <Link
              href={`/#${category.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="relative">
          <ProductGallery productName={product.name} images={product.images} />
          <FavoriteButton productId={product.id} className="absolute right-3 top-3 z-10" />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {category && (
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {category.name}
            </p>
          )}
          <h1 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-bold text-foreground">
            {formatBRL(product.basePrice)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Preço base — personalizações podem alterar o valor final.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4">
              <Clock className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Prazo de produção
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  {productionLabel}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border bg-card p-4">
              <Sparkles className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Feito à mão
                </p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">
                  Peça artesanal única
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Cada peça da Essência Arte é confeccionada artesanalmente em resina, com atenção a
              cada detalhe. Você escolhe cores, glitter, nome e adicionais para criar uma versão
              exclusiva, que reflete a sua história.
            </p>
            <p>
              Após a confirmação do pedido, sua peça entra em produção e é enviada com cuidado
              para todo o Brasil.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/pedido/novo?category=${product.categorySlug}&product=${product.id}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-xl)] bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-md transition-all hover:bg-primary/85 hover:shadow-lg active:scale-[0.98]"
            >
              Personalizar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Você também pode gostar
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/produto/${p.id}`}
                className="group flex flex-col"
              >
                <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-muted">
                  {p.images?.[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="mt-3 flex flex-col gap-1 px-0.5">
                  <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-base font-bold text-foreground">
                    {formatBRL(p.basePrice)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
