"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTransactionStore, useAuthStore, useCategoryStore } from "@/store";
import { useDashboardStore } from "@/store/dashboard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Transaction, TransactionType } from "@/types";
import {
  Pencil,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
} from "lucide-react";
import { CurrencyFormatter, DateFormatter } from "@/shared/formatters";
import { TransactionCalendar } from "@/components/transactions/TransactionCalendar";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";

function getDefaultDate(): string {
  return DateFormatter.nowBrasilia();
}

function extractDateForInput(dateStr: string): string {
  return DateFormatter.toBrasiliaDateString(dateStr);
}

const ITEMS_PER_PAGE = 15;

export default function TransacoesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    transactions,
    recentTransactions,
    fetchTransactions,
    fetchRecentTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading,
    pagination,
  } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { fetchDashboardData } = useDashboardStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as TransactionType,
    categoryId: "",
    date: getDefaultDate(),
  });

  const loadTransactions = useCallback((page?: number) => {
    const params: Record<string, string | number> = {
      limite: ITEMS_PER_PAGE,
      pagina: page || currentPage,
    };
    if (filterType !== "all") params.tipo = filterType === "income" ? "RECEITA" : "DESPESA";
    if (filterCategory !== "all") params.categoriaId = filterCategory;
    if (searchTerm) params.busca = searchTerm;

  if (selectedDate) {
    const dateStr = DateFormatter.toBrasiliaDateString(selectedDate.toISOString());
    params.data = DateFormatter.toAPI(dateStr);
  }

    fetchTransactions(params as any);
  }, [currentPage, filterType, filterCategory, searchTerm, selectedDate, fetchTransactions]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchCategories();
    fetchRecentTransactions();
  }, [isAuthenticated, router, fetchCategories, fetchRecentTransactions]);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterType, filterCategory, selectedDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadTransactions(1);
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => cat.tipo === (formData.type === "income" ? "RECEITA" : "DESPESA"));
  }, [categories, formData.type]);

  useEffect(() => {
    if (filteredCategories.length > 0 && !formData.categoryId) {
      setFormData((prev) => ({ ...prev, categoryId: filteredCategories[0]?.id || "" }));
    }
  }, [filteredCategories, formData.categoryId]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || t.type === filterType;
      const matchesCategory =
        filterCategory === "all" || t.categoryId === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, filterType, filterCategory]);

  const openModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingId(transaction.id);
      setFormData({
        description: transaction.description,
        amount: (transaction.amount / 100).toFixed(2),
        type: transaction.type,
        categoryId: transaction.categoryId,
        date: extractDateForInput(transaction.date),
      });
    } else {
      setEditingId(null);
      const defaultCategory = categories.find(
        (c) => c.tipo === "DESPESA"
      );
      setFormData({
        description: "",
        amount: "",
        type: "expense",
        categoryId: defaultCategory?.id || "",
        date: getDefaultDate(),
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const valor = Math.round(parseFloat(formData.amount) * 100);

    const data = {
      descricao: formData.description,
      valor,
      tipo: formData.type === "income" ? "RECEITA" : "DESPESA",
      categoriaId: formData.categoryId,
      data: DateFormatter.toAPI(formData.date),
    };

      if (editingId) {
        await updateTransaction(editingId, {
          descricao: data.descricao,
          valor: data.valor,
          tipo: data.tipo === "RECEITA" ? "income" : "expense",
          categoriaId: data.categoriaId,
          data: data.data,
        });
      } else {
        await addTransaction({
          descricao: data.descricao,
          valor: data.valor,
          tipo: data.tipo === "RECEITA" ? "income" : "expense",
          categoriaId: data.categoriaId,
          data: data.data,
        });
      }

    loadTransactions(currentPage);
    fetchDashboardData();
    fetchRecentTransactions();
    closeModal();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteTransaction(id);
      loadTransactions(currentPage);
      fetchDashboardData();
      fetchRecentTransactions();
      toast.success("Transação excluída com sucesso!");
      if (editingId === id) {
        closeModal();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir transação");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCalendarDateSelect = (date: Date) => {
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      setSelectedDate(null);
      setCurrentPage(1);
    } else {
      setSelectedDate(date);
      setCurrentPage(1);
    }
  };

  const handleCalendarMonthChange = (year: number, month: number) => {
    setCalendarMonth({ year, month });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.cor || "#6b7280";
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.nome || "Sem categoria";
  };

  const totalPages = pagination.totalPaginas || Math.ceil(pagination.total / ITEMS_PER_PAGE);
  const hasPrev = pagination.hasPaginaAnterior || currentPage > 1;
  const hasNext = pagination.hasProximaPagina || currentPage < totalPages;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transações</h2>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas
          </p>
        </div>
  <div className="flex items-center gap-2">
    <Button onClick={() => openModal()} className="gap-2">
      <Plus className="h-4 w-4" />
      Nova Transação
    </Button>
    <div className="flex items-center rounded-lg border bg-card p-0.5">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2.5"
              onClick={() => setViewMode("table")}
            >
              <List className="h-3.5 w-3.5 mr-1.5" />
              Lista
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2.5"
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Calendário
            </Button>
      </div>
      </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar transação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as TransactionType | "all");
                setCurrentPage(1);
              }}
              className="w-[150px]"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </Select>
            <Select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-[180px]"
            >
              <option value="all">Todas categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </Select>
            {selectedDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDate(null);
                  setCurrentPage(1);
                }}
                className="h-9 gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" />
                {DateFormatter.format(selectedDate.toISOString())}
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className={viewMode === "calendar" ? "grid gap-6 lg:grid-cols-[320px_1fr]" : ""}>
        {viewMode === "calendar" && (
          <TransactionCalendar
            transactions={transactions}
            selectedDate={selectedDate}
            onDateSelect={handleCalendarDateSelect}
            onMonthChange={handleCalendarMonthChange}
          />
        )}

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">
                        Nenhuma transação encontrada
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-full p-1.5 ${
                              transaction.type === "income"
                                ? "bg-green-500/10"
                                : "bg-red-500/10"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <ArrowUpRight className="h-3 w-3 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <span className="font-medium">
                            {transaction.description}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: `${getCategoryColor(transaction.categoryId)}20`,
                            color: getCategoryColor(transaction.categoryId),
                          }}
                        >
                          {getCategoryName(transaction.categoryId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {DateFormatter.format(transaction.date)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.type === "income"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"} {" "}
                        {CurrencyFormatter.format(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openModal(transaction)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(transaction.id)}
                            disabled={deletingId === transaction.id}
                            className="text-destructive hover:text-destructive"
                          >
                            {deletingId === transaction.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                {pagination.total} transação{pagination.total !== 1 ? "ões" : ""} encontrada{pagination.total !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {getPageNumbers().map((page, i) =>
                  typeof page === "string" ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Dialog.Root open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 mx-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <Dialog.Title asChild>
                    <h2 className="text-lg font-semibold tracking-tight">
                      {editingId ? "Editar Transação" : "Nova Transação"}
                    </h2>
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <X className="h-4 w-4" />
                    </Button>
                  </Dialog.Close>
                </div>
                <Dialog.Description asChild>
                  <p className="text-sm text-muted-foreground mt-1">
                    {editingId ? "Atualize os dados da transação" : "Preencha os dados da transação"}
                  </p>
                </Dialog.Description>

                {!editingId && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const defaultCat = categories.find((c) => c.tipo === "RECEITA");
                        setFormData({ ...formData, type: "income", categoryId: defaultCat?.id || "" });
                      }}
                      className={`group relative flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition-all duration-200 ${
                        formData.type === "income"
                          ? "border-emerald-500 bg-emerald-500/10 shadow-sm shadow-emerald-500/10"
                          : "border-border bg-background hover:border-emerald-500/30 hover:bg-emerald-500/5"
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        formData.type === "income"
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/20"
                      }`}>
                        <ArrowUpCircle className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold transition-colors ${formData.type === "income" ? "text-emerald-700" : "text-foreground"}`}>
                          Receita
                        </p>
                        <p className="text-xs text-muted-foreground">Entrada de dinheiro</p>
                      </div>
                      {formData.type === "income" && (
                        <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultCat = categories.find((c) => c.tipo === "DESPESA");
                        setFormData({ ...formData, type: "expense", categoryId: defaultCat?.id || "" });
                      }}
                      className={`group relative flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition-all duration-200 ${
                        formData.type === "expense"
                          ? "border-red-500 bg-red-500/10 shadow-sm shadow-red-500/10"
                          : "border-border bg-background hover:border-red-500/30 hover:bg-red-500/5"
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        formData.type === "expense"
                          ? "bg-red-500 text-white"
                          : "bg-red-500/10 text-red-600 group-hover:bg-red-500/20"
                      }`}>
                        <ArrowDownCircle className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold transition-colors ${formData.type === "expense" ? "text-red-700" : "text-foreground"}`}>
                          Despesa
                        </p>
                        <p className="text-xs text-muted-foreground">Saída de dinheiro</p>
                      </div>
                      {formData.type === "expense" && (
                        <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t" />

              <form onSubmit={handleSubmit}>
                <div className="px-6 py-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Descrição</label>
                    <Input
                      placeholder={formData.type === "income" ? "Ex: Salário mensal" : "Ex: Supermercado"}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Valor (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Data</label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Categoria</label>
                    <Select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                      className="h-11"
                    >
                      {filteredCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nome}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="border-t px-6 py-4 flex gap-3 bg-muted/30">
                  {editingId ? (
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1"
                      disabled={deletingId === editingId}
                      onClick={() => handleDelete(editingId)}
                    >
                      {deletingId === editingId ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Excluir
                    </Button>
                  ) : null}
                  <Dialog.Close asChild>
                    <Button type="button" variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  </Dialog.Close>
                  <Button
                    type="submit"
                    className={`flex-1 ${
                      formData.type === "income"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {editingId ? "Salvar Alterações" : formData.type === "income" ? "Adicionar Receita" : "Adicionar Despesa"}
                  </Button>
                </div>
              </form>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
