'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CurrencyInputFormatter } from '@/shared/formatters'
import { useCategoryStore, useTransactionStore } from '@/store'
import { useDashboardStore } from '@/store/dashboard-store'

interface TransactionDialogProps {
  type: 'income' | 'expense'
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDialog({ type, open, onOpenChange }: TransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { categories, fetchCategories } = useCategoryStore()
  const { addTransaction, fetchTransactions } = useTransactionStore()
  const { fetchDashboardData } = useDashboardStore()

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
  })

  const filteredCategories = categories.filter(
    (cat) => cat.tipo === (type === 'income' ? 'RECEITA' : 'DESPESA')
  )

  useEffect(() => {
    if (open) {
      fetchCategories()
      setFormData({
        amount: '',
        description: '',
        categoryId: filteredCategories[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
      })
    }
  }, [open, type, fetchCategories])

  useEffect(() => {
    if (filteredCategories.length > 0 && !formData.categoryId) {
      setFormData((prev) => ({ ...prev, categoryId: filteredCategories[0].id }))
    }
  }, [filteredCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const valor = CurrencyInputFormatter.parseToCents(formData.amount)
      
      if (valor <= 0) {
        toast.error('Valor deve ser maior que zero')
        setIsLoading(false)
        return
      }

      if (!formData.description.trim()) {
        toast.error('Descrição é obrigatória')
        setIsLoading(false)
        return
      }

      if (!formData.categoryId) {
        toast.error('Selecione uma categoria')
        setIsLoading(false)
        return
      }

      await addTransaction({
        descricao: formData.description,
        valor,
        tipo: type,
        categoriaId: formData.categoryId,
        data: new Date(formData.date).toISOString(),
      })

      fetchTransactions({ limite: 100 })
      fetchDashboardData()

      toast.success(type === 'income' ? 'Receita adicionada!' : 'Despesa adicionada!')
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar')
    } finally {
      setIsLoading(false)
    }
  }

  const isIncome = type === 'income'
  const accentColor = isIncome ? 'text-green-600' : 'text-red-600'
  const accentBorder = isIncome ? 'border-green-500' : 'border-red-500'

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card text-card-foreground rounded-lg border shadow-xl z-50 p-6">
          <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${accentBorder}`}>
            {isIncome ? (
              <ArrowUpCircle className="w-6 h-6 text-green-600" />
            ) : (
              <ArrowDownCircle className="w-6 h-6 text-red-600" />
            )}
            <Dialog.Title className={`text-lg font-medium ${accentColor}`}>
              {isIncome ? 'Adicionar Receita' : 'Adicionar Despesa'}
            </Dialog.Title>
            <Dialog.Close className="ml-auto p-2 hover:bg-muted rounded-md">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="text"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Salário mensal"
                maxLength={100}
              />
            </div>

            <div>
              <Label>Categoria</Label>
              <Select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
