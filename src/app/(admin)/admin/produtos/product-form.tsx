"use client"

import { useState } from "react"
import { createProduct, updateProduct, createCategory } from "./actions"
import { toast } from "sonner"
import { X, Plus, ChevronDown, ChevronRight, ChevronLeft, Star } from "lucide-react"

type Product = {
  id: string
  name: string
  base_price: number
  category_id: string | null
  images: string[] | null
  product_category_links: { category_id: string }[]
  product_options: { option_id: string }[]
}

type Category = { id: string; name: string }
type Option = { id: string; name: string; type: string }

type Preview =
  | { src: string; isExisting: true }
  | { src: string; isExisting: false; file: File }

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
  onToggle,
  onToggleAll,
}: {
  label: string
  options: Option[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: (ids: string[], select: boolean) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const allSelected = options.every((o) => selectedIds.has(o.id))
  const ids = options.map((o) => o.id)

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
        <div className="max-h-40 overflow-y-auto">
          {/* Selecionar todos */}
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer px-3 py-1.5 border-b border-input bg-muted/20 hover:bg-muted/40 text-muted-foreground">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => onToggleAll(ids, !allSelected)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Selecionar todos
          </label>
          <div className="grid grid-cols-1 gap-0.5 p-2">
            {options.map((o) => (
              <label
                key={o.id}
                className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/60 px-2 py-1.5 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(o.id)}
                  onChange={() => onToggle(o.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                {o.name}
              </label>
            ))}
          </div>
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
  const [previews, setPreviews] = useState<Preview[]>(
    (product?.images ?? []).filter(Boolean).map((src) => ({ src, isExisting: true }))
  )
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    product?.product_category_links.map((l) => l.category_id) ?? []
  )
  const [selectedOptionIds, setSelectedOptionIds] = useState<Set<string>>(
    new Set(product?.product_options.map((l) => l.option_id) ?? [])
  )
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  // ── Imagens ──────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const newPreviews: Preview[] = files.map((file) => ({
      src: URL.createObjectURL(file),
      isExisting: false,
      file,
    }))
    setPreviews((prev) => [...prev, ...newPreviews])
    e.target.value = ""
  }

  function removePreview(index: number) {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function movePreview(index: number, direction: -1 | 1) {
    setPreviews((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target]!, next[index]!]
      return next
    })
  }

  // ── Categorias ───────────────────────────────────────────────────────────

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

  // ── Opções ───────────────────────────────────────────────────────────────

  function toggleOption(id: string) {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAllOptions(ids: string[], select: boolean) {
    setSelectedOptionIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => (select ? next.add(id) : next.delete(id)))
      return next
    })
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selectedCategoryIds.length === 0) {
      toast.error("Selecione ao menos uma categoria.")
      return
    }
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    // Imagens na ordem atual: existentes → URLs, novas → Files
    previews.forEach((p) => {
      if (p.isExisting) {
        formData.append("existingImageUrls", p.src)
      } else {
        formData.append("imageFiles", p.file)
      }
    })

    // Opções selecionadas (controlled — não vêm do form HTML)
    selectedOptionIds.forEach((id) => formData.append("optionIds", id))

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

  // ── Agrupamento de opções ─────────────────────────────────────────────────

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

  // ── Render ────────────────────────────────────────────────────────────────

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
                  type="text"
                  inputMode="decimal"
                  id="basePrice"
                  name="basePrice"
                  defaultValue={product?.base_price != null ? product.base_price.toFixed(2) : ""}
                  placeholder="0,00"
                  required
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value.replace(",", "."))
                    if (!isNaN(val)) e.target.value = val.toFixed(2)
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Imagens */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Imagens do Produto
                  {previews.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      — primeira imagem é a capa
                    </span>
                  )}
                </label>

                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {previews.map((p, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={p.src}
                          alt={`Imagem ${i + 1}`}
                          className="h-24 w-full object-cover rounded-lg border border-input"
                        />
                        {/* Indicador de capa */}
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-primary/90 text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                            <Star className="h-2.5 w-2.5" /> Capa
                          </span>
                        )}
                        {/* Controles hover */}
                        <div className="absolute inset-0 flex items-center justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => movePreview(i, -1)}
                            disabled={i === 0}
                            className="h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-30"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePreview(i, 1)}
                            disabled={i === previews.length - 1}
                            className="h-6 w-6 flex items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-30"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
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

                <div
                  className="flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed border-input bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors py-4"
                  onClick={() => document.getElementById("imageFileInput")?.click()}
                >
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground mt-1">
                    {previews.length > 0 ? "Adicionar mais imagens" : "Clique para selecionar imagens"}
                  </span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WEBP</span>
                </div>
                <input
                  id="imageFileInput"
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
                <div className="space-y-1 max-h-40 overflow-y-auto p-4 border border-input rounded-md">
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
                <div className="space-y-2">
                  {Object.entries(commonGroups).map(([type, opts]) => (
                    <OptionsGroup
                      key={type}
                      label={typeLabels[type] ?? type}
                      options={opts}
                      selectedIds={selectedOptionIds}
                      onToggle={toggleOption}
                      onToggleAll={toggleAllOptions}
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
                        onToggle={toggleOption}
                        onToggleAll={toggleAllOptions}
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
