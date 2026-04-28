"use client"

import { useState } from "react"
import { createOption } from "./actions"
import { toast } from "sonner"
import { X } from "lucide-react"

export function OptionForm({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createOption(formData)

    if (result.success) {
      toast.success("Opção criada!")
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
          <h2 className="text-xl font-bold text-foreground">Nova Opção</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Nome (Ex: Dourado, Tassel Rosa)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
              Tipo
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue=""
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>Selecione o tipo...</option>
              <option value="color">Cor Principal (color)</option>
              <option value="glitter">Glitter (glitter)</option>
              <option value="tassel_color">Cor do Tassel (tassel_color)</option>
              <option value="extra">Adicional / Extra (extra)</option>
              <option value="packaging">Embalagem (packaging)</option>
              <option value="shipping">Frete (shipping)</option>
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
              Preço (Opcional)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              step="0.01"
              min="0"
              defaultValue="0"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3 mt-4 bg-muted/50 p-3 rounded-md border border-border">
            <input
              type="checkbox"
              id="isTangible"
              name="isTangible"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isTangible" className="text-sm font-medium text-foreground">
              Possui Estoque Físico? (Tangível)
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Marque caso precise controlar a quantidade dessa opção no inventário (ex: Tassel, Pingente, Embalagem).
          </p>

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
              {isLoading ? "Salvando..." : "Criar Opção"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
