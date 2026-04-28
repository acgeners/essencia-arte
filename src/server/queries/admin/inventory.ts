import { createClient } from "@/lib/supabase/server"

export async function getAdminInventory() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("options")
    .select("id, name, type, inventory(quantity)")
    .eq("is_tangible", true)
    .order("name")

  if (error) throw error
  
  // Transformar para facilitar
  return data.map(opt => ({
    id: opt.id,
    name: opt.name,
    type: opt.type,
    quantity: opt.inventory && Array.isArray(opt.inventory) ? opt.inventory[0]?.quantity || 0 : 0
  }))
}
