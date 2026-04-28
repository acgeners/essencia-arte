import { getAdminInventory } from "@/server/queries/admin/inventory"
import { InventoryList } from "./inventory-list"

export const metadata = {
  title: "Controle de Estoque | Admin",
}

export default async function AdminInventoryPage() {
  const items = await getAdminInventory()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <InventoryList items={items} />
    </div>
  )
}
