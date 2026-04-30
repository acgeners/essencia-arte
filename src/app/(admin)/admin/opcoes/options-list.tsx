"use client"

import { useState } from "react"
import { Plus, Power, Link as LinkIcon, X } from "lucide-react"
import { formatBRL } from "@/lib/format"
import { toggleOptionActive, updateOptionProducts } from "./actions"
import { toast } from "sonner"
import { OptionForm } from "./option-form"

type Option = {
  id: string
  name: string
  type: string
  price: number | null
  is_tangible: boolean | null
  is_active: boolean | null
  product_options: { product_id: string }[]
}

type Product = {
  id: string
  name: string
}

export function OptionsList({ options, products }: { options: Option[], products: Product[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [linkingOption, setLinkingOption] = useState<Option | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  // Agrupar por tipo
  const groupedOptions = options.reduce((acc, opt) => {
    const t = opt.type || "outros"
    if (!acc[t]) acc[t] = []
    acc[t].push(opt)
    return acc
  }, {} as Record<string, Option[]>)

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const result = await toggleOptionActive(id, currentStatus)
    if (result.success) {
      toast.success(currentStatus ? "Opção desativada" : "Opção ativada")
    } else {
      toast.error(result.error || "Erro ao alterar status")
    }
  }

  const openLinkModal = (option: Option) => {
    setLinkingOption(option)
    setSelectedProducts(new Set(option.product_options.map(p => p.product_id)))
  }

  const saveLinks = async () => {
    if (!linkingOption) return
    const result = await updateOptionProducts(linkingOption.id, Array.from(selectedProducts))
    if (result.success) {
      toast.success("Vínculos atualizados!")
      setLinkingOption(null)
    } else {
      toast.error(result.error || "Erro ao salvar vínculos")
    }
  }

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Opções</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ative, desative e controle quais opções aparecem em quais produtos.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Nova Opção
        </button>
      </div>

      <div className="grid gap-8">
        {Object.entries(groupedOptions).map(([type, opts]) => (
          <div key={type} className="rounded-md border border-border bg-card overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b border-border sm:px-6">
              <h2 className="font-bold text-foreground uppercase tracking-wider text-sm">Tipo: {type}</h2>
            </div>
            <div className="grid gap-3 p-3 md:hidden">
              {opts.map((opt) => (
                <article key={opt.id} className="rounded-[var(--radius-lg)] border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">{opt.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {opt.price ? formatBRL(opt.price) : "Sem adicional"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle(opt.id, opt.is_active || false)}
                      className={`inline-flex shrink-0 items-center justify-center p-2 rounded-md transition-colors ${
                        opt.is_active 
                        ? "bg-green-100 text-green-700 hover:bg-green-200" 
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                      title={opt.is_active ? "Desativar" : "Ativar"}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      Estoque: {opt.is_tangible ? "Sim" : "Não"}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${opt.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {opt.is_active ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                  <button
                    onClick={() => openLinkModal(opt)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {opt.product_options.length === 0 ? "Global (Todos)" : `${opt.product_options.length} produtos`}
                  </button>
                </article>
              ))}
            </div>
            <table className="hidden w-full text-sm text-left text-muted-foreground md:table">
              <thead className="text-xs uppercase bg-background text-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-semibold">Nome</th>
                  <th className="px-6 py-3 font-semibold">Preço</th>
                  <th className="px-6 py-3 font-semibold text-center">Controle Estoque?</th>
                  <th className="px-6 py-3 font-semibold text-center">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Vínculo de Produto</th>
                </tr>
              </thead>
              <tbody>
                {opts.map((opt) => (
                  <tr key={opt.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {opt.name}
                    </td>
                    <td className="px-6 py-4">
                      {opt.price ? formatBRL(opt.price) : "-"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {opt.is_tangible ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Sim</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Não</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggle(opt.id, opt.is_active || false)}
                        className={`inline-flex items-center justify-center p-1.5 rounded-md transition-colors ${
                          opt.is_active 
                          ? "bg-green-100 text-green-700 hover:bg-green-200" 
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                        title={opt.is_active ? "Desativar" : "Ativar"}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openLinkModal(opt)}
                        className="inline-flex items-center gap-1.5 text-primary hover:text-primary-hover font-medium"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {opt.product_options.length === 0 ? "Global (Todos)" : `${opt.product_options.length} produtos`}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {isFormOpen && <OptionForm onClose={() => setIsFormOpen(false)} />}

      {/* Link Modal */}
      {linkingOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                Vincular: {linkingOption.name}
              </h2>
              <button onClick={() => setLinkingOption(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Se nenhum produto for selecionado, esta opção aparecerá em <strong>todos</strong> os produtos do site.
            </p>

            <div className="max-h-[300px] overflow-y-auto space-y-2 border border-border rounded-md p-2">
              {products.map(p => (
                <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(p.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedProducts)
                      if (e.target.checked) newSet.add(p.id)
                      else newSet.delete(p.id)
                      setSelectedProducts(newSet)
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => setLinkingOption(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveLinks}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
              >
                Salvar Vínculos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
