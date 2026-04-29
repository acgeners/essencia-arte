"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signup(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos." }
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." }
  }

  const supabase = await createClient()

  // signUp cria o user em auth.users + trigger cria o espelho em customers
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
    },
  })

  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      return { error: "Este e-mail já está cadastrado." }
    }
    return { error: "Erro ao criar conta. Tente novamente." }
  }

  // Faz login imediatamente após o cadastro
  await supabase.auth.signInWithPassword({ email, password })

  redirect("/minha-conta")
}
