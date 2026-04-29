"use client"

import { useState, useRef } from "react"
import { createProduct, updateProduct, createCategory } from "./actions"
import { toast } from "sonner"
import { X, Plus, ChevronDown, ChevronRight } from "lucide-react"

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

const DELIVERY_TYPES = new Set(["shipping", "packaging"])

const typeLabels: Record<string, string> = {
  color: "Cores",
  glitter: "Glitters",
  tassel_color: "Tassels",
  extra: "Adicionais",
  packaging: "Embalagens",
  shipping: "Entrega",
}

function OptionsGroup({
  label,
  options,
  selectedIds,
}: {
  label: string
  options: Option[]
  selectedIds: Set<string>
}) {
  const [expanded, setExpanded] = useState(true)
  return (
    <div className="border border-input rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 bg-muted/40 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:bg-muted/70 transition-colors"
      >
        {label}
        {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {expanded && (
        <div className="grid grid-cols-1 gap-0.5 p-2">
          {options.map((o) => (
            <label
              key={o.id}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/60 px-2 py-1.5 rounded"
            >
              <input
                type="checkbox"
                name="optionIds"
                value={o.id}
                defaultChecked={selectedIds.has(o.id)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              {o.name}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProductForm({
  product,
  categories,
  options,
  onClose,
}: {
  product: Product | null
  categories: Category[]
  options: Option[]
  onClose: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [previews, setPreviews] = useState<{ src: string; isExisting: boolean }[]>(
    (product?.images ?? []).filter(Boolean).map((src) => ({ src, isExisting: true }))
  )
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.product_category_links.map((l) => l.category_id) ?? []
  )
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const newFilesRef = useRef<File[]>([])

  const selectedOptionIds = new Set(
    product?.product_options.map((l) => l.option_id) ?? []
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    newFilesRef.current = [...newFilesRef.current, ...files]
    const newPreviews = files.map((f) => ({ src: URL.createObjectURL(f), isExisting: false }))
    setPreviews((prev) => [...prev, ...newPreviews])
    // Reset input so same file can be re-added
    e.target.value = ""
  }

  function removePreview(index: number) {
    setPreviews((prev) => {
      const item = prev[index]
      if (item && !item.isExisting) {
        // Remove from new files too (match by position among non-existing)
        const nonExistingBefore = prev.slice(0, index).filter((p) => !p.isExisting).length
        newFilesRef.current = newFilesRef.current.filter((_, i) => i !== nonExistingBefore)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    setIsAddingCategory(true)
    const result = await createCategory(newCategoryName.trim())
    if (result.success) {
      setLocalCategories((prev) =>
        [...prev, result.category].sort((a, b) => a.name.localeCompare(b.name))
      )
      setSelectedCategoryIds((prev) => [...prev, result.category.id])
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

    // Imagens existentes a manter
    previews
      .filter((p) => p.isExisting)
      .forEach((p) => formData.append("existingImageUrls", p.src))

    // Novos arquivos
    newFilesRef.current.forEach((f) => formData.append("imageFiles", f))

    selectedCategoryIds.forEach((id) => formData.append("categoryIds", id))

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

  // Separar opções comuns das opções de entrega
  const commonOptions = options.filter((o) => !DELIVERY_TYPES.has(o.type))
  const deliveryOptions = options.filter((o) => DELIVERY_TYPES.has(o.type))

  const groupByType = (opts: Option[]) =>
    opts.reduce((acc, opt) => {
      if (!acc[opt.type]) acc[opt.type] = []
      acc[opt.type]!.push(opt)
      return acc
    }, {} as Record<string, Option[]>)

  const commonGroups = groupByType(commonOptions)
  const deliveryGroups = groupByType(deliveryOptions)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-xl bg-card p-6 shadow-xl border border-border overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {product ? "Editar Produto" : "Novo Produto"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Coluna esquerda */}
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

              {/* Imagens */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Imagens do Produto
                </label>

                {/* Grade de previews */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {previews.map((p, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={p.src}
                          alt={`Imagem ${i + 1}`}
                          className="h-24 w-full object-cover rounded-lg border border-input"
                        />
                        <button
                          type="button"
                          onClick={() => removePreview(i)}
                          className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botão de adicionar */}
                <div
                  className="flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed border-input bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors py-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground mt-1">
                    {previews.length > 0 ? "Adicionar mais imagens" : "Clique para selecionar imagens"}
                  </span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WEBP</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Categorias */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Categorias (Selecione 1 ou mais)
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto p-2 border border-input rounded-md">
                  {localCategories.map((c) => (
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
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); handleAddCategory() }
                      }}
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

            {/* Coluna direita */}
            <div className="space-y-4">
              {/* Opções Disponíveis */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Opções Disponíveis
                </label>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {Object.entries(commonGroups).map(([type, opts]) => (
                    <OptionsGroup
                      key={type}
                      label={typeLabels[type] ?? type}
                      options={opts}
                      selectedIds={selectedOptionIds}
                    />
                  ))}
                </div>
              </div>

              {/* Opções de Entrega */}
              {deliveryOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Opções de Entrega
                  </label>
                  <div className="space-y-2">
                    {Object.entries(deliveryGroups).map(([type, opts]) => (
                      <OptionsGroup
                        key={type}
                        label={typeLabels[type] ?? type}
                        options={opts}
                        selectedIds={selectedOptionIds}
                      />
                    ))}
                  </div>
                </div>
              )}
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
