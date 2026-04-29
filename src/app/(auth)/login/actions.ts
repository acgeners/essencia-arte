"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const next = (formData.get("next") as string | null) || "/admin"

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios." }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "E-mail ou senha inválidos." }
  }

  redirect(next)
}
