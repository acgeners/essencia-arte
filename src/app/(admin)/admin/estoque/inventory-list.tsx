"use client"

import { useState, useEffect } from "react"
import { updateInventory } from "./actions"
import { toast } from "sonner"
import { Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type InventoryItem = {
  id: string
  name: string
  type: string
  quantity: number
}

export function InventoryList({ items: initialItems }: { items: InventoryItem[] }) {
  const [itemsList, setItemsList] = useState(initialItems)
  const [quantities, setQuantities] = useState<Record<string, number>>(
    initialItems.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {})
  )
  const [savingId, setSavingId] = useState<string | null>(null)

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'inventory' },
        (payload) => {
          const updated = payload.new as { option_id: string, quantity: number }
          // Atualizar a lista de itens (que vem do servidor via query complexa, mas aqui temos os IDs)
          setItemsList(current => current.map(item => {
            if (item.id === updated.option_id) {
              return { ...item, quantity: updated.quantity }
            }
            return item
          }))
          
          // Se o usuário não estiver editando este campo específico (ou se o valor for igual ao que ele acabou de salvar)
          // nós sincronizamos o input também
          setQuantities(current => {
            if (current[updated.option_id] === undefined) return current
            return { ...current, [updated.option_id]: updated.quantity }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleSave = async (id: string) => {
    setSavingId(id)
    const newQty = quantities[id] ?? 0
    const result = await updateInventory(id, newQty)
    
    if (result.success) {
      toast.success("Estoque atualizado!")
    } else {
      toast.error(result.error || "Erro ao atualizar estoque")
    }
    setSavingId(null)
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-foreground">Controle de Estoque</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajuste as quantidades dos itens físicos (tangíveis). Itens com quantidade 0 saem da vitrine automaticamente.
        </p>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="grid gap-3 p-3 md:hidden">
          {itemsList.map((item) => {
            const currentQty = quantities[item.id] ?? 0
            const realTimeQty = item.quantity
            const isChanged = currentQty !== realTimeQty
            const isLowStock = currentQty <= 5

            return (
              <article key={item.id} className="rounded-[var(--radius-lg)] border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-foreground">{item.name}</h2>
                    <span className="mt-2 inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      {item.type}
                    </span>
                  </div>
                  {isLowStock && <span className="shrink-0 text-[10px] font-bold uppercase text-red-500">Atenção</span>}
                </div>
                <div className="mt-4 flex items-end gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quantidade</span>
                    <input
                      type="number"
                      min="0"
                      value={currentQty}
                      onChange={(e) => setQuantities({ ...quantities, [item.id]: parseInt(e.target.value) || 0 })}
                      className={`mt-1 h-10 w-full rounded-md border ${isLowStock ? 'border-red-300 focus:ring-red-500' : 'border-input focus:ring-primary'} bg-background px-3 text-sm focus:outline-none focus:ring-2`}
                    />
                  </label>
                  <button
                    onClick={() => handleSave(item.id)}
                    disabled={!isChanged || savingId === item.id}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
                    title="Salvar"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </div>
                {realTimeQty !== currentQty && (
                  <p className="mt-2 text-[10px] italic text-muted-foreground">No banco: {realTimeQty}</p>
                )}
              </article>
            )
          })}
          {itemsList.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum item tangível cadastrado. Vá em Opções para cadastrar.
            </div>
          )}
        </div>

        <table className="hidden w-full text-sm text-left text-muted-foreground md:table">
          <thead className="text-xs uppercase bg-muted/50 text-foreground border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Item</th>
              <th className="px-6 py-4 font-semibold">Tipo</th>
              <th className="px-6 py-4 font-semibold w-48">Quantidade Físico</th>
              <th className="px-6 py-4 font-semibold text-right w-24">Ação</th>
            </tr>
          </thead>
          <tbody>
            {itemsList.map((item) => {
              const currentQty = quantities[item.id] ?? 0
              const realTimeQty = item.quantity
              const isChanged = currentQty !== realTimeQty
              const isLowStock = currentQty <= 5

              return (
                <tr key={item.id} className="border-b border-border hover:bg-muted/20">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {item.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={currentQty}
                        onChange={(e) => setQuantities({ ...quantities, [item.id]: parseInt(e.target.value) || 0 })}
                        className={`w-24 rounded-md border ${isLowStock ? 'border-red-300 focus:ring-red-500' : 'border-input focus:ring-primary'} bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2`}
                      />
                      {isLowStock && <span className="text-[10px] font-bold text-red-500 uppercase">Atenção</span>}
                      {realTimeQty !== currentQty && (
                        <span className="text-[10px] text-muted-foreground italic">(No banco: {realTimeQty})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSave(item.id)}
                      disabled={!isChanged || savingId === item.id}
                      className="inline-flex items-center justify-center p-2 rounded-md transition-colors bg-primary/10 text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground"
                      title="Salvar"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
            {itemsList.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  Nenhum item tangível cadastrado. Vá em Opções para cadastrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
