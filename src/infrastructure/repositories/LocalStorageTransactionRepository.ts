// src/infrastructure/repositories/LocalStorageTransactionRepository.ts

import type { Transaction } from '@/domain/entities/Transaction'
import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'

const STORAGE_KEY = '@finapp:transactions'

export class LocalStorageTransactionRepository implements ITransactionRepository {
  async save(transaction: Transaction): Promise<void> {
    const transactions = await this.findAll()
    transactions.push(transaction)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    }
  }

  async findAll(): Promise<Transaction[]> {
    if (typeof window === 'undefined') return []
    
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []
      return JSON.parse(data) as Transaction[]
    } catch {
      return []
    }
  }

  async deleteById(id: string): Promise<void> {
    const transactions = await this.findAll()
    const filtered = transactions.filter(t => t.id !== id)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    }
  }
}