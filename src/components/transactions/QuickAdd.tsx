"use client";

import { useState, useEffect, useRef } from "react";
import { useCategoryStore, useTransactionStore } from "@/store";
import { useDashboardStore } from "@/store/dashboard-store";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, Loader2, X, Check } from "lucide-react";
import { DateFormatter } from "@/shared/formatters";
import { toast } from "sonner";
import { TransactionType } from "@/types";

interface QuickAddProps {
  type: TransactionType;
  onClose: () => void;
  onSaved: () => void;
}

export function QuickAdd({ type, onClose, onSaved }: QuickAddProps) {
  const { categories, fetchCategories } = useCategoryStore();
  const { addTransaction, fetchRecentTransactions } = useTransactionStore();
  const { fetchDashboardData } = useDashboardStore();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(DateFormatter.nowBrasilia());
  const [saving, setSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = categories.filter(
    (cat) => cat.tipo === (type === "income" ? "RECEITA" : "DESPESA")
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, categoryId]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      toast.error("Preencha descrição e valor");
      return;
    }

    setSaving(true);
    try {
      await addTransaction({
        descricao: description,
        valor: Math.round(parseFloat(amount) * 100),
        tipo: type,
        categoriaId: categoryId,
        data: DateFormatter.toAPI(date),
      });

      fetchDashboardData();
      fetchRecentTransactions();
      toast.success(type === "income" ? "Receita adicionada!" : "Despesa adicionada!");
      onSaved();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const isIncome = type === "income";
  const accent = isIncome ? "green" : "red";

  return (
    <div
      className={`rounded-xl border-2 ${isIncome ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"} p-4 animate-in slide-in-from-top-2 duration-200`}
    >
      <div className="flex items-center gap-2 mb-3">
        {isIncome ? (
          <ArrowUpCircle className="h-5 w-5 text-green-600" />
        ) : (
          <ArrowDownCircle className="h-5 w-5 text-red-600" />
        )}
        <span className={`font-semibold text-sm ${isIncome ? "text-green-700" : "text-red-700"}`}>
          {isIncome ? "Nova Receita" : "Nova Despesa"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-6 w-6"
          onClick={onClose}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px_140px_120px_auto]">
          <Input
            ref={inputRef}
            placeholder={isIncome ? "Ex: Salário" : "Ex: Mercado"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`h-9 text-sm bg-background ${isIncome ? "border-green-500/20 focus:border-green-500/40" : "border-red-500/20 focus:border-red-500/40"}`}
          />
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="R$ 0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`h-9 text-sm bg-background ${isIncome ? "border-green-500/20 focus:border-green-500/40" : "border-red-500/20 focus:border-red-500/40"}`}
          />
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`h-9 text-sm bg-background ${isIncome ? "border-green-500/20" : "border-red-500/20"}`}
          >
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`h-9 text-sm bg-background ${isIncome ? "border-green-500/20 focus:border-green-500/40" : "border-red-500/20 focus:border-red-500/40"}`}
          />
          <Button
            type="submit"
            size="icon"
            disabled={saving}
            className={`h-9 w-9 shrink-0 ${isIncome ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
