"use client"

import { useState, useMemo } from "react"
import { Pencil, Trash2, Plus, Filter } from "lucide-react"
import { formatBRL } from "@/lib/format"
import { deleteProduct } from "./actions"
import { ProductForm } from "./product-form"
import { toast } from "sonner"

type Product = {
  id: string
  name: string
  base_price: number
  production_days_min: number | null
  production_days_max: number | null
  category_id: string | null
  images: string[] | null
  product_category_links: { category_id: string; categories: { id: string; name: string } | null }[]
  product_options: { option_id: string; options: { id: string; type: string } | null }[]
}

const typeLabels: Record<string, string> = {
  color: "Cores",
  glitter: "Glitters",
  tassel_color: "Tassels",
  extra: "Adicionais",
  packaging: "Embalagens",
  shipping: "Entrega",
}

type Category = {
  id: string
  name: string
}

type Option = {
  id: string
  name: string
  type: string
}

export function ProductsList({ 
  products, 
  categories,
  options
}: { 
  products: Product[], 
  categories: Category[],
  options: Option[]
}) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filteredProducts = useMemo(() => {
    if (categoryFilter === "all") return products
    return products.filter(p => 
      p.category_id === categoryFilter || 
      p.product_category_links.some(link => link.category_id === categoryFilter)
    )
  }, [products, categoryFilter])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return

    setIsDeleting(id)
    const result = await deleteProduct(id)
    if (result.success) {
      toast.success("Produto excluído com sucesso!")
    } else {
      toast.error(result.error || "Erro ao excluir produto")
    }
    setIsDeleting(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Gerenciar Produtos</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent focus:outline-none"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs uppercase bg-muted/50 text-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Nome</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold">Opções</th>
                <th className="px-6 py-4 font-semibold">Preço Base</th>
                <th className="px-6 py-4 font-semibold">Produção</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/20">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.product_category_links.length === 0
                        ? <span>-</span>
                        : product.product_category_links.map((l) => (
                          <span key={l.category_id} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {l.categories?.name ?? l.category_id}
                          </span>
                        ))
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[220px]">
                    {product.product_options.length === 0 ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(
                          product.product_options.reduce((acc, o) => {
                            const type = o.options?.type ?? "outro"
                            acc[type] = (acc[type] ?? 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                        ).map(([type, count]) => (
                          <span key={type} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {typeLabels[type] ?? type}: {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {formatBRL(product.base_price)}
                  </td>
                  <td className="px-6 py-4">
                    {product.production_days_min ?? 3} a {product.production_days_max ?? 5} dias úteis
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeleting === product.id}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 disabled:opacity-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <ProductForm 
          product={editingProduct} 
          categories={categories}
          options={options}
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  )
}
