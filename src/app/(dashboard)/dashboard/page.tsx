"use client";

import { useMemo } from "react";
import { useTransactionStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseChart } from "@/components/charts/expense-chart";
import { MonthlyBarChart } from "@/components/charts/monthly-chart";
import { generateCategoryData, generateMonthlyData } from "@/lib/mockData";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function DashboardPage() {
  const { transactions } = useTransactionStore();

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const categoryData = useMemo(() => generateCategoryData(transactions), [transactions]);
  const monthlyData = useMemo(() => generateMonthlyData(transactions), [transactions]);

  const stats = [
    {
      title: "Saldo Atual",
      value: summary.balance,
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Receitas",
      value: summary.income,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: "+12%",
    },
    {
      title: "Despesas",
      value: summary.expense,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      trend: "-5%",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral das suas finanças</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  {stat.trend && (
                    <span
                      className={`text-xs font-medium ${
                        stat.trend.startsWith("+") ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {stat.trend}
                    </span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">
                    R$ {stat.value.toLocaleString("pt-BR")}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <MonthlyBarChart data={monthlyData} />
        <ExpenseChart data={categoryData} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimas Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full p-2 ${
                        transaction.type === "income"
                          ? "bg-green-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-medium ${
                      transaction.type === "income" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}R${" "}
                    {transaction.amount.toLocaleString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dicas de Economia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Reduza gastos com alimentação</p>
                  <p className="text-xs text-muted-foreground">
                    Cozinhar em casa pode economizar até 40% do seu orçamento mensal.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Aumente sua renda</p>
                  <p className="text-xs text-muted-foreground">
                    Considere freelances ou investimentos para diversificar fontes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <Wallet className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Reserve para emergências</p>
                  <p className="text-xs text-muted-foreground">
                    Ideal: 3-6 meses de despesas em reserva.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
