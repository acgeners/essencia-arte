"use client"

import { useState, useActionState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { login } from "@/app/(auth)/login/actions"
import { signup } from "@/app/(public)/minha-conta/actions"
import { Button } from "@/components/ui/button"

type AuthState = { error: string } | null

function PasswordInput({ id, name }: { id: string; name: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        autoComplete={name === "password" ? "current-password" : "new-password"}
        required
        placeholder="••••••••"
        className="h-11 w-full rounded-lg border border-border bg-muted/40 px-4 pr-11 text-sm transition-all focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    async (_prev, formData) => (await login(formData)) ?? null,
    null
  )

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-display font-semibold text-foreground">
        Bem-vinda de volta!
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Entre na sua conta para continuar.
      </p>

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
          <PasswordInput id="login-password" name="password" />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <Button type="submit" className="h-11 w-full mt-2" disabled={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Primeira vez aqui?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-primary hover:underline"
        >
          Cadastre-se
        </button>
      </p>
    </div>
  )
}

function SignupForm({ onSwitch }: { onSwitch: () => void }) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    async (_prev, formData) => (await signup(formData)) ?? null,
    null
  )

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-display font-semibold text-foreground">
        Crie sua conta
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        É rápido e gratuito.
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-name" className="text-sm font-medium text-foreground">
            Nome
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Seu nome"
            className="h-11 w-full rounded-lg border border-border bg-muted/40 px-4 text-sm transition-all focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-email" className="text-sm font-medium text-foreground">
            E-mail
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="seu@email.com"
            className="h-11 w-full rounded-lg border border-border bg-muted/40 px-4 text-sm transition-all focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-password" className="text-sm font-medium text-foreground">
            Senha
          </label>
          <PasswordInput id="signup-password" name="password" />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <Button type="submit" className="h-11 w-full mt-2" disabled={isPending}>
          {isPending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-primary hover:underline"
        >
          Entrar
        </button>
      </p>
    </div>
  )
}

export function AccountAuth() {
  const [view, setView] = useState<"login" | "signup">("login")

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      {view === "login"
        ? <LoginForm onSwitch={() => setView("signup")} />
        : <SignupForm onSwitch={() => setView("login")} />
      }
    </div>
  )
}
