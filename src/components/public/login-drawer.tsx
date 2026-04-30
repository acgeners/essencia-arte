"use client"

import { useState, useActionState } from "react"
import { Eye, EyeOff, Heart } from "lucide-react"
import { login } from "@/app/(auth)/login/actions"
import { Button } from "@/components/ui/button"

interface LoginPanelProps {
  open: boolean
  onClose: () => void
}

type LoginState = { error: string } | null

export function LoginPanel({ open, onClose }: LoginPanelProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    async (_prev, formData) => {
      const result = await login(formData)
      return result ?? null
    },
    null
  )

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-card shadow-lg">
        <div className="mx-auto flex max-w-md flex-col gap-5 px-6 py-8">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-primary text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Minha Conta
            </h2>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value="/" />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-sm font-medium text-foreground">
                E-mail
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="seu@email.com"
                className="h-11 w-full rounded-lg border border-border bg-muted/40 px-4 text-sm transition-all focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-border bg-muted/40 px-4 pr-11 text-sm transition-all focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {state?.error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                {state.error}
              </p>
            )}

            <Button type="submit" className="h-11 w-full" disabled={isPending}>
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Primeira vez aqui?{" "}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511999999999"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Entre em contato
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
