"use client";

import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyFormatter, DateFormatter } from "@/shared/formatters";
import { Transaction } from "@/types";

interface TransactionCalendarProps {
  transactions: Transaction[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onMonthChange: (year: number, month: number) => void;
}

interface DayTransactions {
  income: number;
  expense: number;
  items: Transaction[];
}

export function TransactionCalendar({
  transactions,
  selectedDate,
  onDateSelect,
  onMonthChange,
}: TransactionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const transactionsByDay = useMemo(() => {
    const map = new Map<string, DayTransactions>();
    transactions.forEach((t) => {
      const dateKey = DateFormatter.toBrasiliaDateString(t.date);
      const existing = map.get(dateKey) || { income: 0, expense: 0, items: [] };
      if (t.type === "income") {
        existing.income += t.amount;
      } else {
        existing.expense += t.amount;
      }
      existing.items.push(t);
      map.set(dateKey, existing);
    });
    return map;
  }, [transactions]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const weeks: Date[][] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const handlePrevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    setCurrentMonth(prev);
    onMonthChange(prev.getFullYear(), prev.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const next = addMonths(currentMonth, 1);
    setCurrentMonth(next);
    onMonthChange(next.getFullYear(), next.getMonth() + 1);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(now);
    onMonthChange(now.getFullYear(), now.getMonth() + 1);
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleToday}>
              <span className="text-xs">Hoje</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-0">
          {weekDays.map((wd) => (
            <div
              key={wd}
              className="py-1 text-center text-xs font-medium text-muted-foreground"
            >
              {wd}
            </div>
          ))}
          {weeks.map((week, wi) =>
            week.map((d, di) => {
              const dateKey = format(d, "yyyy-MM-dd");
              const dayData = transactionsByDay.get(dateKey);
              const inMonth = isSameMonth(d, currentMonth);
              const selected = selectedDate ? isSameDay(d, selectedDate) : false;
              const today = isToday(d);

              return (
                <button
                  key={`${wi}-${di}`}
                  onClick={() => inMonth && onDateSelect(d)}
                  disabled={!inMonth}
                  className={`
                    relative flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-sm transition-colors
                    min-h-[52px]
                    ${!inMonth ? "text-muted-foreground/30 cursor-default" : "hover:bg-muted cursor-pointer"}
                    ${selected ? "bg-primary/15 ring-2 ring-primary/50" : ""}
                    ${today && !selected ? "bg-primary/5" : ""}
                  `}
                >
                  <span
                    className={`
                      text-xs font-medium
                      ${today ? "text-primary" : ""}
                      ${selected ? "text-primary font-bold" : ""}
                    `}
                  >
                    {format(d, "d")}
                  </span>
                  {dayData && inMonth && (
                    <div className="flex flex-col items-center gap-px w-full px-0.5">
                      {dayData.income > 0 && (
                        <div className="h-1 w-full max-w-[20px] rounded-full bg-green-500" />
                      )}
                      {dayData.expense > 0 && (
                        <div className="h-1 w-full max-w-[20px] rounded-full bg-red-500" />
                      )}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {selectedDate && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">
                {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => onDateSelect(selectedDate)}
              >
                Limpar
              </Button>
            </div>
            {(() => {
              const dateKey = format(selectedDate, "yyyy-MM-dd");
              const dayData = transactionsByDay.get(dateKey);
              if (!dayData || dayData.items.length === 0) {
                return (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma transação neste dia
                  </p>
                );
              }
              return (
                <div className="space-y-2">
                  {dayData.income > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">Receitas</span>
                      <span className="font-medium text-green-600">
                        +{CurrencyFormatter.format(dayData.income)}
                      </span>
                    </div>
                  )}
                  {dayData.expense > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-600">Despesas</span>
                      <span className="font-medium text-red-600">
                        -{CurrencyFormatter.format(dayData.expense)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm border-t pt-2">
                    <span className="font-medium">Saldo do dia</span>
                    <span
                      className={`font-bold ${
                        dayData.income - dayData.expense >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {CurrencyFormatter.format(dayData.income - dayData.expense)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-3 rounded-full bg-green-500" />
            Receitas
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-3 rounded-full bg-red-500" />
            Despesas
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
