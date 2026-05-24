"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";
import { CurrencyFormatter, DateFormatter } from "@/shared/formatters";

interface RecentTransactionsProps {
  transactions: Transaction[];
  title?: string;
  compact?: boolean;
}

export function RecentTransactions({
  transactions,
  title = "Últimas Transações",
  compact = false,
}: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={compact ? "text-sm" : "text-base"}>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhuma transação encontrada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={compact ? "text-sm" : "text-base"}>
          {title}
        </CardTitle>
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
                  <p className="text-sm font-medium">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.categoryName || transaction.category} &middot;{" "}
                    {DateFormatter.formatShort(transaction.date)}
                  </p>
                </div>
              </div>
              <p
                className={`font-medium ${
                  transaction.type === "income"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}{" "}
                {CurrencyFormatter.format(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
