"use client";

import { useState, useEffect, useMemo } from "react";
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
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  X,
} from "lucide-react";
import { CurrencyFormatter, DateFormatter, CurrencyInputFormatter } from "@/shared/formatters";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";

export default function TransacoesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    transactions,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading,
  } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { fetchDashboardData } = useDashboardStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as TransactionType,
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchTransactions({ limite: 100 });
    fetchCategories();
  }, [isAuthenticated, router, fetchTransactions, fetchCategories]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => cat.tipo === (formData.type === "income" ? "RECEITA" : "DESPESA"));
  }, [categories, formData.type]);

  useEffect(() => {
    if (filteredCategories.length > 0 && !formData.categoryId) {
      setFormData((prev) => ({ ...prev, categoryId: filteredCategories[0]?.id || "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCategories]);

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
        amount: CurrencyInputFormatter.fromStorage(transaction.amount),
        type: transaction.type,
        categoryId: transaction.categoryId,
        date: transaction.date.split("T")[0],
      });
    } else {
      setEditingId(null);
      const defaultCategory = filteredCategories[0];
      setFormData({
        description: "",
        amount: "",
        type: "expense",
        categoryId: defaultCategory?.id || "",
        date: new Date().toISOString().split("T")[0],
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
      const valorEmCentavos = CurrencyInputFormatter.parseToCents(formData.amount);
      
      const data = {
        descricao: formData.description,
        valor: valorEmCentavos,
        tipo: formData.type === "income" ? "RECEITA" : "DESPESA",
        categoriaId: formData.categoryId,
        data: new Date(formData.date).toISOString(),
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

      fetchTransactions({ limite: 100 });
      fetchDashboardData();
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) {
      return;
    }
    try {
      await deleteTransaction(id);
      fetchTransactions({ limite: 100 });
      fetchDashboardData();
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.cor || "#6b7280";
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.nome || "Sem categoria";
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
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      <Card>
        <CardHeader>
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
              onChange={(e) =>
                setFilterType(e.target.value as TransactionType | "all")
              }
              className="w-[150px]"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </Select>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-[180px]"
            >
              <option value="all">Todas categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

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
                      {CurrencyFormatter.formatValue(transaction.amount)}
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
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog.Root open={isModalOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 mx-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Dialog.Title asChild>
                    <CardTitle>
                      {editingId ? "Editar Transação" : "Nova Transação"}
                    </CardTitle>
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </Dialog.Close>
                </div>
                <Dialog.Description asChild>
                  <CardDescription>
                    {editingId
                      ? "Atualize os dados da transação"
                      : "Preencha os dados da transação"}
                  </CardDescription>
                </Dialog.Description>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Input
                      placeholder="Ex: Salário Empresa"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <Select
                      value={formData.type}
                      onChange={(e) => {
                        const newType = e.target.value as TransactionType;
                        const defaultCat = categories.find(
                          (c) => c.tipo === (newType === "income" ? "RECEITA" : "DESPESA")
                        );
                        setFormData({
                          ...formData,
                          type: newType,
                          categoryId: defaultCat?.id || "",
                        });
                      }}
                      required
                    >
                      <option value="income">Receita</option>
                      <option value="expense">Despesa</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <Select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categoryId: e.target.value,
                        })
                      }
                      required
                    >
                      {filteredCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nome}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                </CardContent>
                <div className="p-6 pt-0 flex gap-3">
                  <Dialog.Close asChild>
                    <Button type="button" variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  </Dialog.Close>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    {editingId ? "Salvar Alterações" : "Adicionar Transação"}
                  </Button>
                </div>
              </form>
            </Card>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
