// src/domain/repositories/ITransactionRepository.ts

import type { Transaction, CreateTransactionDTO } from '../entities/Transaction'

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<void>
  findAll(): Promise<Transaction[]>
  deleteById(id: string): Promise<void>
}