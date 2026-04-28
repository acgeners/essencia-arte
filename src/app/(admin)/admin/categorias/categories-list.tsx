"use client"

import { useState } from "react"
import { Pencil, Trash2, Plus } from "lucide-react"
import { deleteCategory } from "./actions"
import { CategoryForm } from "./category-form"
import { toast } from "sonner"

type Category = {
  id: string
  name: string
  slug: string
  productsCount: number
}

export function CategoriesList({ categories }: { categories: Category[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsFormOpen(true)
  }

  const handleAddNew = () => {
    setEditingCategory(null)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string, count: number) => {
    if (count > 0) {
      toast.error("Não é possível excluir uma categoria que já tem produtos vinculados.")
      return
    }

    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return

    setIsDeleting(id)
    const result = await deleteCategory(id)
    if (result.success) {
      toast.success("Categoria excluída com sucesso!")
    } else {
      toast.error(result.error || "Erro ao excluir categoria")
    }
    setIsDeleting(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Gerenciar Categorias</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      <div className="rounded-md border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs uppercase bg-muted/50 text-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Nome da Categoria</th>
                <th className="px-6 py-4 font-semibold">Slug (URL)</th>
                <th className="px-6 py-4 font-semibold text-center">Produtos Vinculados</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-border hover:bg-muted/20">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4">
                    /{cat.slug}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      {cat.productsCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-primary/10"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.productsCount)}
                        disabled={isDeleting === cat.id}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10 disabled:opacity-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <CategoryForm 
          category={editingCategory} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  )
}
