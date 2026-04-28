"use client"

import { useState, useRef } from "react"
import { createProduct, updateProduct, createCategory } from "./actions"
import { toast } from "sonner"
import { X, Plus } from "lucide-react"

type Product = {
  id: string
  name: string
  base_price: number
  category_id: string | null
  images: string[] | null
  product_category_links: { category_id: string }[]
  product_options: { option_id: string }[]
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

export function ProductForm({
  product,
  categories,
  options,
  onClose
}: {
  product: Product | null,
  categories: Category[],
  options: Option[],
  onClose: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(product?.images?.[0] || "")
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.product_category_links.map(l => l.category_id) ?? []
  )
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isOptionSelected = (id: string) =>
    product?.product_options.some(link => link.option_id === id) ?? false

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    setIsAddingCategory(true)
    const result = await createCategory(newCategoryName.trim())
    if (result.success) {
      setLocalCategories(prev => [...prev, result.category].sort((a, b) => a.name.localeCompare(b.name)))
      setSelectedCategoryIds(prev => [...prev, result.category.id])
      setNewCategoryName("")
      setShowNewCategory(false)
      toast.success("Categoria criada!")
    } else {
      toast.error(result.error || "Erro ao criar categoria")
    }
    setIsAddingCategory(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedCategoryIds.length === 0) {
      toast.error("Selecione ao menos uma categoria.")
      return
    }
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    selectedCategoryIds.forEach(id => formData.append("categoryIds", id))

    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData)

    if (result.success) {
      toast.success(product ? "Produto atualizado!" : "Produto criado!")
      onClose()
    } else {
      toast.error(result.error || "Ocorreu um erro")
      setIsLoading(false)
    }
  }

  const groupedOptions = options.reduce((acc, opt) => {
    const group = acc[opt.type] ?? []
    group.push(opt)
    acc[opt.type] = group
    return acc
  }, {} as Record<string, Option[]>)

  const typeLabels: Record<string, string> = {
    color: "Cores",
    glitter: "Glitters",
    tassel_color: "Tassels",
    extra: "Adicionais",
    packaging: "Embalagens",
    shipping: "Entrega"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl bg-card p-6 shadow-xl border border-border overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {product ? "Editar Produto" : "Novo Produto"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo oculto para preservar imagem existente na edição */}
          <input type="hidden" name="existingImageUrl" value={product?.images?.[0] || ""} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={product?.name}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="basePrice" className="block text-sm font-medium text-foreground mb-1">
                  Preço Base (R$)
                </label>
                <input
                  type="number"
                  id="basePrice"
                  name="basePrice"
                  step="0.01"
                  min="0"
                  defaultValue={product?.base_price}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Imagem do Produto
                </label>
                <div
                  className="relative flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed border-input bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                  style={{ minHeight: "120px" }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg"
                        onError={() => setPreviewUrl("")}
                      />
                      <span className="absolute bottom-1 right-2 text-xs text-muted-foreground bg-background/80 px-1 rounded">
                        Clique para trocar
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-6 text-muted-foreground">
                      <Plus className="h-8 w-8" />
                      <span className="text-sm">Clique para selecionar imagem</span>
                      <span className="text-xs">JPG, PNG, WEBP</span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categorias (Selecione 1 ou mais)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-input rounded-md">
                  {localCategories.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(c.id)}
                        onChange={() => toggleCategory(c.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {c.name}
                    </label>
                  ))}
                </div>

                {showNewCategory ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Nome da categoria"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddCategory() } }}
                      autoFocus
                      className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={isAddingCategory || !newCategoryName.trim()}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                    >
                      {isAddingCategory ? "..." : "Adicionar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewCategory(false); setNewCategoryName("") }}
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    Nova categoria
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Opções Disponíveis (Selecione opções que se aplicam ao produto)
              </label>
              <div className="space-y-4 max-h-[400px] overflow-y-auto p-3 border border-input rounded-md bg-muted/20">
                {Object.entries(groupedOptions).map(([type, opts]) => (
                  <div key={type}>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 px-1">
                      {typeLabels[type] || type}
                    </h4>
                    <div className="grid grid-cols-1 gap-1">
                      {opts.map(o => (
                        <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/80 p-1 rounded">
                          <input
                            type="checkbox"
                            name="optionIds"
                            value={o.id}
                            defaultChecked={isOptionSelected(o.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          {o.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
