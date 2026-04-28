import { getAdminOptions, getBasicProducts } from "@/server/queries/admin/options"
import { OptionsList } from "./options-list"

export const metadata = {
  title: "Gerenciar Opções | Admin",
}

export default async function AdminOptionsPage() {
  const [options, products] = await Promise.all([
    getAdminOptions(),
    getBasicProducts()
  ])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <OptionsList options={options} products={products} />
    </div>
  )
}
