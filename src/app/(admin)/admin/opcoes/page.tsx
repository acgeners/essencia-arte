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
    <div className="mx-auto max-w-6xl p-0 sm:p-6">
      <OptionsList options={options} products={products} />
    </div>
  )
}
