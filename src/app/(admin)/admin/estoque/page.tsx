import { getAdminInventory } from "@/server/queries/admin/inventory"
import { InventoryList } from "./inventory-list"

export const metadata = {
  title: "Controle de Estoque | Admin",
}

export default async function AdminInventoryPage() {
  const items = await getAdminInventory()

  return (
    <div className="mx-auto max-w-5xl p-0 sm:p-6">
      <InventoryList items={items} />
    </div>
  )
}
