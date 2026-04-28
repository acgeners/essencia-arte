import { getAdminProducts, getAdminCategories } from "@/server/queries/admin/products"
import { getAdminOptions } from "@/server/queries/admin/options"
import { ProductsList } from "./products-list"

export const metadata = {
  title: "Gerenciar Produtos | Admin",
}

export default async function AdminProductsPage() {
  const [products, categories, options] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminOptions()
  ])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ProductsList 
        products={products as any} 
        categories={categories} 
        options={options as any}
      />
    </div>
  )
}
