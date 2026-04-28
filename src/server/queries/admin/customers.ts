import { createClient } from "@/lib/supabase/server"

export async function getAdminCustomers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .select("*, orders(id, code, total, status, created_at)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}
