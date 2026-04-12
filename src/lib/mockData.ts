import { Transaction, TransactionCategory, CategoryData, MonthlyData } from "@/types";

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  salario: "#22c55e",
  freelance: "#10b981",
  investimento: "#14b8a6",
  alimentacao: "#f59e0b",
  moradia: "#ef4444",
  transporte: "#f97316",
  lazer: "#ec4899",
  saude: "#8b5cf6",
  educacao: "#6366f1",
  outros: "#6b7280",
};

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  salario: "Banknote",
  freelance: "Briefcase",
  investimento: "TrendingUp",
  alimentacao: "Utensils",
  moradia: "Home",
  transporte: "Car",
  lazer: "Gamepad2",
  saude: "Heart",
  educacao: "GraduationCap",
  outros: "Package",
};

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    description: "Salário Empresa XYZ",
    amount: 8500,
    type: "income",
    category: "salario",
    date: "2024-01-05",
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
  },
  {
    id: "2",
    description: "Freelance Projeto Web",
    amount: 2500,
    type: "income",
    category: "freelance",
    date: "2024-01-10",
    createdAt: "2024-01-10T14:30:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
  },
  {
    id: "3",
    description: "Aluguel Apartamento",
    amount: 1800,
    type: "expense",
    category: "moradia",
    date: "2024-01-01",
    createdAt: "2024-01-01T09:00:00Z",
    updatedAt: "2024-01-01T09:00:00Z",
  },
  {
    id: "4",
    description: "Supermercado Extra",
    amount: 450,
    type: "expense",
    category: "alimentacao",
    date: "2024-01-08",
    createdAt: "2024-01-08T11:20:00Z",
    updatedAt: "2024-01-08T11:20:00Z",
  },
  {
    id: "5",
    description: "Uber / Gasolina",
    amount: 320,
    type: "expense",
    category: "transporte",
    date: "2024-01-12",
    createdAt: "2024-01-12T08:15:00Z",
    updatedAt: "2024-01-12T08:15:00Z",
  },
  {
    id: "6",
    description: "Netflix + Spotify",
    amount: 65,
    type: "expense",
    category: "lazer",
    date: "2024-01-15",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "7",
    description: "Plano de Saúde",
    amount: 350,
    type: "expense",
    category: "saude",
    date: "2024-01-20",
    createdAt: "2024-01-20T09:30:00Z",
    updatedAt: "2024-01-20T09:30:00Z",
  },
  {
    id: "8",
    description: "Curso Udemy",
    amount: 199,
    type: "expense",
    category: "educacao",
    date: "2024-01-22",
    createdAt: "2024-01-22T16:45:00Z",
    updatedAt: "2024-01-22T16:45:00Z",
  },
  {
    id: "9",
    description: "Aplicação Poupança",
    amount: 1000,
    type: "income",
    category: "investimento",
    date: "2024-01-25",
    createdAt: "2024-01-25T15:00:00Z",
    updatedAt: "2024-01-25T15:00:00Z",
  },
  {
    id: "10",
    description: "Conta de Luz",
    amount: 180,
    type: "expense",
    category: "moradia",
    date: "2024-01-28",
    createdAt: "2024-01-28T10:00:00Z",
    updatedAt: "2024-01-28T10:00:00Z",
  },
];

export const generateCategoryData = (transactions: Transaction[]): CategoryData[] => {
  const expenses = transactions.filter((t) => t.type === "expense");
  const categoryMap = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryMap).map(([category, value]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value,
    color: CATEGORY_COLORS[category as TransactionCategory],
  }));
};

export const generateMonthlyData = (transactions: Transaction[]): MonthlyData[] => {
  const months = ["Set", "Out", "Nov", "Dez", "Jan", "Fev"];
  return months.map((month) => {
    const monthTransactions = transactions.filter((t) =>
      month === "Jan" ? t.date.includes("2024-01") : true
    );
    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      month,
      income,
      expense,
      balance: income - expense,
    };
  });
};
