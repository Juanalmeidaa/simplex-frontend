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
