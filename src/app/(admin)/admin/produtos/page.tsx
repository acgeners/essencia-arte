import { getAdminProducts, getAdminCategories } from "@/server/queries/admin/products"
import { getAdminOptions } from "@/server/queries/admin/options"
import { ProductsList, type Option, type Product } from "./products-list"

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
    <div className="mx-auto max-w-7xl p-0 sm:p-6">
      <ProductsList 
        products={products as Product[]} 
        categories={categories} 
        options={options as Option[]}
      />
    </div>
  )
}
