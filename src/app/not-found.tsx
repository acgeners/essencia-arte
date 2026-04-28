import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-6xl font-semibold text-primary">404</h1>
      <h2 className="mt-4 font-display text-2xl font-medium text-foreground">
        Página não encontrada
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Ops! A página que você procura não existe ou foi movida.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-[var(--radius-lg)] bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary-hover"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
