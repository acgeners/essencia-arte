import Link from "next/link"
import Image from "next/image"
import { Package, Search } from "lucide-react"
import { searchProducts } from "@/server/queries/catalog"
import { formatBRL } from "@/lib/format"

export const metadata = {
  title: "Busca | Essência & Arte",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? "").trim()
  const products = query ? await searchProducts(query) : []

  return (
    <div className="mx-auto min-h-[60vh] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Search className="h-4 w-4" />
        {query ? (
          <span>
            {products.length} resultado{products.length === 1 ? "" : "s"} para{" "}
            <strong className="text-foreground">&ldquo;{query}&rdquo;</strong>
          </span>
        ) : (
          <span>Digite algo na busca para encontrar produtos.</span>
        )}
      </div>

      {query && products.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-display text-lg font-semibold text-foreground">
            Nenhum produto encontrado
          </p>
          <p className="text-sm text-muted-foreground">
            Tente outro termo ou veja todas as coleções.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Ver coleções
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group flex flex-col">
              <Link
                href={`/produto/${product.id}`}
                className="relative aspect-square overflow-hidden rounded-[var(--radius-lg)] bg-primary/5"
              >
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </Link>
              <div className="mt-3 flex flex-col gap-1 px-0.5">
                <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-base font-bold text-foreground">
                  {formatBRL(product.basePrice)}
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  <Link
                    href={`/produto/${product.id}`}
                    className="flex h-9 items-center justify-center rounded-full border border-foreground bg-white text-xs font-bold uppercase tracking-widest text-foreground transition-all hover:bg-foreground hover:text-white"
                  >
                    Ver produto
                  </Link>
                  <Link
                    href={`/pedido/novo?category=${product.categorySlug}&product=${product.id}`}
                    className="flex h-9 items-center justify-center rounded-full bg-primary text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90"
                  >
                    Personalizar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
