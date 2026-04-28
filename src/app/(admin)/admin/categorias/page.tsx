import { getAdminCategoriesList } from "@/server/queries/admin/categories"
import { CategoriesList } from "./categories-list"

export const metadata = {
  title: "Gerenciar Categorias | Admin",
}

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategoriesList()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <CategoriesList categories={categories} />
    </div>
  )
}
