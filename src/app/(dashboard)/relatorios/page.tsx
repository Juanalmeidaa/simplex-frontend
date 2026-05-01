"use client";

import { useMemo } from "react";
import { useTransactionStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectionChart } from "@/components/charts/projection-chart";
import { ExpenseChart } from "@/components/charts/expense-chart";
import { generateCategoryData } from "@/lib/mockData";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  DollarSign,
  PiggyBank,
} from "lucide-react";
import { CurrencyFormatter } from "@/shared/formatters";

export default function RelatoriosPage() {
  const { transactions } = useTransactionStore();

  const analysis = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    const categoryExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const highestCategory = Object.entries(categoryExpenses).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      income,
      expense,
      balance,
      savingsRate,
      highestCategory: highestCategory
        ? {
            name: highestCategory[0],
            value: highestCategory[1],
          }
        : null,
    };
  }, [transactions]);

  const projectionData = useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    const avgExpense = analysis.expense;
    const growthRate = 1.05;

    return months.map((month, index) => ({
      month,
      atual: index === 0 ? avgExpense : 0,
      projetado: avgExpense * Math.pow(growthRate, index),
    }));
  }, [analysis.expense]);

  const recommendations = [
    {
      icon: PiggyBank,
      title: "Meta de Economia",
      description: `Tente poupar ${CurrencyFormatter.format(Math.round(analysis.income * 0.2))} mensais (20% da renda)`,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: TrendingDown,
      title: "Reduzir Gastos",
      description:
        analysis.highestCategory
          ? `Atenção com ${analysis.highestCategory.name} (${CurrencyFormatter.format(analysis.highestCategory.value)})`
          : "Continue controlando seus gastos",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: TrendingUp,
      title: "Aumentar Renda",
      description:
        "Considere buscar novas fontes de renda como freelances ou investimentos",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Target,
      title: "Taxa de Poupança",
      description: `Sua taxa atual é de ${analysis.savingsRate.toFixed(1)}%. Meta: 20%+`,
      color:
        analysis.savingsRate >= 20
          ? "text-green-500"
          : analysis.savingsRate >= 10
          ? "text-yellow-500"
          : "text-red-500",
      bgColor:
        analysis.savingsRate >= 20
          ? "bg-green-500/10"
          : analysis.savingsRate >= 10
          ? "bg-yellow-500/10"
          : "bg-red-500/10",
    },
  ];

  const categoryData = useMemo(() => generateCategoryData(transactions), [transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios</h2>
        <p className="text-muted-foreground">
          Análises e projeções do seu financeiro
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Receitas</p>
                <p className="text-xl font-bold text-green-500">
                  {CurrencyFormatter.format(analysis.income)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-red-500/10 p-3">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Despesas</p>
                <p className="text-xl font-bold text-red-500">
                  {CurrencyFormatter.format(analysis.expense)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p
                  className={`text-xl font-bold ${
                    analysis.balance >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {CurrencyFormatter.format(analysis.balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-amber-500/10 p-3">
                <PiggyBank className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa Poupança</p>
                <p
                  className={`text-xl font-bold ${
                    analysis.savingsRate >= 20
                      ? "text-green-500"
                      : analysis.savingsRate >= 10
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {analysis.savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProjectionChart data={projectionData} title="Projeção de Despesas (6 meses)" />
        <ExpenseChart data={categoryData} title="Distribuição de Gastos" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Recomendações Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div className={`rounded-lg p-2 ${rec.bgColor}`}>
                    <Icon className={`h-5 w-5 ${rec.color}`} />
                  </div>
                  <div>
                    <p className="font-medium">{rec.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {rec.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
