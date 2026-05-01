// src/store/useTransactionStore.ts

import { create } from 'zustand'
import type { Transaction, CreateTransactionDTO } from '@/domain/entities/Transaction'
import { LocalStorageTransactionRepository } from '@/infrastructure/repositories/LocalStorageTransactionRepository'
import { CreateTransactionUseCase } from '@/application/use-cases/CreateTransactionUseCase'

interface TransactionStore {
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
  
  addTransaction: (dto: CreateTransactionDTO) => Promise<void>
  loadTransactions: () => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  
  getTotalIncome: () => number
  getTotalExpenses: () => number
  getBalance: () => number
  
  formatCurrency: (cents: number) => string
}

const repository = new LocalStorageTransactionRepository()
const createUseCase = new CreateTransactionUseCase(repository)

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  addTransaction: async (dto: CreateTransactionDTO) => {
    set({ isLoading: true, error: null })
    try {
      const transaction = await createUseCase.execute(dto)
      set(state => ({
        transactions: [...state.transactions, transaction],
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao adicionar transação',
        isLoading: false,
      })
      throw error
    }
  },

  loadTransactions: async () => {
    set({ isLoading: true, error: null })
    try {
      const transactions = await repository.findAll()
      set({ transactions, isLoading: false })
    } catch {
      set({ transactions: [], isLoading: false })
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      await repository.deleteById(id)
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Erro ao excluir transação',
      })
    }
  },

  getTotalIncome: () => {
    const { transactions } = get()
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getTotalExpenses: () => {
    const { transactions } = get()
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  },

  getBalance: () => {
    return get().getTotalIncome() - get().getTotalExpenses()
  },

  formatCurrency: (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  },
}))