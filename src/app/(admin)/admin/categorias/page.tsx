import { getAdminCategoriesList } from "@/server/queries/admin/categories"
import { CategoriesList } from "./categories-list"

export const metadata = {
  title: "Gerenciar Categorias | Admin",
}

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategoriesList()

  return (
    <div className="mx-auto max-w-5xl p-0 sm:p-6">
      <CategoriesList categories={categories} />
    </div>
  )
}
