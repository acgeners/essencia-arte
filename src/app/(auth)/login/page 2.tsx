"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Heart } from "lucide-react"
import { login } from "./actions"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Server actions com redirect jogam um erro interno do Next.js.
    // Vamos chamar a action e lidar com o resultado de erro (se houver).
    const result = await login(formData).catch(() => {
      // O Next.js usa throw error para o redirect, então isso é normal.
      // Se não for redirect, nós tratamos o erro visual no UI.
    })

    if (result && "error" in result) {
      setError(result.error as string)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/">
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Essência <span className="text-primary">&</span> Arte
            </h1>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Painel Administrativo
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[--radius-xl] border border-border bg-card p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="rounded-[--radius-md] bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@essenciaearte.com.br"
                className="flex h-10 w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-[--radius-md] border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-10 w-full items-center justify-center rounded-[--radius-lg] bg-primary text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              ← Voltar à loja
            </Link>
          </div>
        </div>

        {/* Brand footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Cada detalhe, feito com amor{" "}
          <Heart className="inline-block h-3 w-3 text-primary" />
        </p>
      </div>
    </div>
  )
}
