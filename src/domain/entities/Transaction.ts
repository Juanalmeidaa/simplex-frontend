// src/domain/entities/Transaction.ts

export type TransactionType = 'income' | 'expense'

export type TransactionCategory = 
  | 'salario'
  | 'freelance'
  | 'investimentos'
  | 'aluguel_recebido'
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'lazer'
  | 'moradia'
  | 'educacao'
  | 'outros'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number // em centavos
  description: string
  category: TransactionCategory
  date: string // ISO 8601
  createdAt: string
}

export interface CreateTransactionDTO {
  type: TransactionType
  amount: number
  description: string
  category: TransactionCategory
  date: string
}