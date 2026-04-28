"use client"

import { useState } from "react"
import { createCategory, updateCategory } from "./actions"
import { toast } from "sonner"
import { X } from "lucide-react"

type Category = {
  id: string
  name: string
}

export function CategoryForm({ 
  category, 
  onClose 
}: { 
  category: Category | null, 
  onClose: () => void 
}) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    
    const result = category 
      ? await updateCategory(category.id, formData)
      : await createCategory(formData)

    if (result.success) {
      toast.success(category ? "Categoria atualizada!" : "Categoria criada!")
      onClose()
    } else {
      toast.error(result.error || "Ocorreu um erro")
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {category ? "Editar Categoria" : "Nova Categoria"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Nome da Categoria
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={category?.name}
              placeholder="Ex: Chaveiros Resinados"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              O slug (URL) será gerado automaticamente a partir do nome.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
