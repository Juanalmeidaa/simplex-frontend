// src/application/use-cases/CreateTransactionUseCase.ts

import type { ITransactionRepository } from '@/domain/repositories/ITransactionRepository'
import type { Transaction, CreateTransactionDTO } from '@/domain/entities/Transaction'

export class CreateTransactionUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  async execute(dto: CreateTransactionDTO): Promise<Transaction> {
    this.validate(dto)

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...dto,
    }

    await this.repository.save(transaction)
    return transaction
  }

  private validate(dto: CreateTransactionDTO): void {
    if (!dto.amount || dto.amount <= 0) {
      throw new Error('O valor deve ser maior que zero')
    }

    if (!dto.description || dto.description.trim() === '') {
      throw new Error('A descrição é obrigatória')
    }

    if (dto.description.length > 100) {
      throw new Error('A descrição deve ter no máximo 100 caracteres')
    }

    if (!dto.category || dto.category.trim() === '') {
      throw new Error('A categoria é obrigatória')
    }
  }
}