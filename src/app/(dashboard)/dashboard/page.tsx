"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store";
import { useDashboardStore } from "@/store/dashboard-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseChart } from "@/components/charts/expense-chart";
import { MonthlyBarChart } from "@/components/charts/monthly-chart";
import { useTransactionStore } from "@/store";
import { Select } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

const OPCAO_MESES = [
  { value: "1", label: "Este mês" },
  { value: "2", label: "Últimos 2 meses" },
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Último ano" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { 
    categoryData, 
    monthlyData, 
    statistics,
    fetchDashboardData,
    isLoading,
    error,
  } = useDashboardStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const [mesesSelecionados, setMesesSelecionados] = useState("6");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchTransactions({ limite: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetchDashboardData(parseInt(mesesSelecionados));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesesSelecionados]);

  const balance = statistics.totalReceitas - statistics.totalDespesas;

  const stats = [
    {
      title: "Saldo Atual",
      value: balance,
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Receitas",
      value: statistics.totalReceitas,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Despesas",
      value: statistics.totalDespesas,
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        <div className="w-[200px]">
          <Select
            value={mesesSelecionados}
            onChange={(e) => setMesesSelecionados(e.target.value)}
          >
            {OPCAO_MESES.map((mes) => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-4 text-red-500">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
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
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma transação encontrada.
              </p>
            ) : (
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
                          {transaction.categoryName || transaction.category}
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
            )}
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
