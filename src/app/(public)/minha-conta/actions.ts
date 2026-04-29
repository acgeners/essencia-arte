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

  await supabase.auth.signInWithPassword({ email, password })

  redirect("/minha-conta")
}

export async function updateProfile(formData: FormData) {
  const name = formData.get("name") as string

  if (!name?.trim()) {
    return { error: "O nome não pode estar vazio." }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Não autenticado." }

  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: name.trim() },
  })

  if (authError) return { error: "Erro ao atualizar nome." }

  await supabase
    .from("customers")
    .update({ full_name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", user.id)

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const current = formData.get("current_password") as string
  const next = formData.get("new_password") as string
  const confirm = formData.get("confirm_password") as string

  if (!current || !next || !confirm) {
    return { error: "Preencha todos os campos." }
  }

  if (next.length < 6) {
    return { error: "A nova senha deve ter pelo menos 6 caracteres." }
  }

  if (next !== confirm) {
    return { error: "As senhas não coincidem." }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) return { error: "Não autenticado." }

  // Verifica senha atual fazendo login
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  })

  if (signInError) return { error: "Senha atual incorreta." }

  const { error } = await supabase.auth.updateUser({ password: next })

  if (error) return { error: "Erro ao atualizar senha." }

  return { success: true }
}

export async function getAddresses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from("customer_addresses")
    .select("*")
    .eq("customer_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  return data ?? []
}

export async function createAddress(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Não autenticado." }

  const isDefault = formData.get("is_default") === "true"

  if (isDefault) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", user.id)
  }

  const { error } = await supabase.from("customer_addresses").insert({
    customer_id: user.id,
    label: (formData.get("label") as string) || null,
    zip_code: formData.get("zip_code") as string,
    street: formData.get("street") as string,
    number: formData.get("number") as string,
    complement: (formData.get("complement") as string) || null,
    district: formData.get("district") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string,
    is_default: isDefault,
  })

  if (error) return { error: "Erro ao salvar endereço." }

  return { success: true }
}

export async function updateAddress(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Não autenticado." }

  const isDefault = formData.get("is_default") === "true"

  if (isDefault) {
    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", user.id)
  }

  const { error } = await supabase
    .from("customer_addresses")
    .update({
      label: (formData.get("label") as string) || null,
      zip_code: formData.get("zip_code") as string,
      street: formData.get("street") as string,
      number: formData.get("number") as string,
      complement: (formData.get("complement") as string) || null,
      district: formData.get("district") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      is_default: isDefault,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("customer_id", user.id)

  if (error) return { error: "Erro ao atualizar endereço." }

  return { success: true }
}

export async function deleteAddress(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Não autenticado." }

  const { error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", id)
    .eq("customer_id", user.id)

  if (error) return { error: "Erro ao remover endereço." }

  return { success: true }
}

export async function setDefaultAddress(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: "Não autenticado." }

  await supabase
    .from("customer_addresses")
    .update({ is_default: false })
    .eq("customer_id", user.id)

  const { error } = await supabase
    .from("customer_addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("customer_id", user.id)

  if (error) return { error: "Erro ao definir endereço padrão." }

  return { success: true }
}
