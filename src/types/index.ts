export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "salario"
  | "freelance"
  | "investimento"
  | "alimentacao"
  | "moradia"
  | "transporte"
  | "lazer"
  | "saude"
  | "educacao"
  | "outros";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface ProjectionData {
  month: string;
  actual: number;
  projected: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: TransactionCategory;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
