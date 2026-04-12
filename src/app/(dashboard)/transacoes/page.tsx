"use client";

import { useState, useMemo } from "react";
import { useTransactionStore } from "@/store";
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
import { Transaction, TransactionType, TransactionCategory } from "@/types";
import { CATEGORY_COLORS } from "@/lib/mockData";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react";

const categories: TransactionCategory[] = [
  "salario",
  "freelance",
  "investimento",
  "alimentacao",
  "moradia",
  "transporte",
  "lazer",
  "saude",
  "educacao",
  "outros",
];

export default function TransacoesPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } =
    useTransactionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | "all">("all");

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as TransactionType,
    category: "outros" as TransactionCategory,
    date: new Date().toISOString().split("T")[0],
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || t.type === filterType;
      const matchesCategory =
        filterCategory === "all" || t.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, filterType, filterCategory]);

  const openModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingId(transaction.id);
      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
      });
    } else {
      setEditingId(null);
      setFormData({
        description: "",
        amount: "",
        type: "expense",
        category: "outros",
        date: new Date().toISOString().split("T")[0],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: "outros",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
    };

    if (editingId) {
      updateTransaction(editingId, data);
    } else {
      addTransaction(data);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      deleteTransaction(id);
    }
  };

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
              onChange={(e) =>
                setFilterCategory(
                  e.target.value as TransactionCategory | "all"
                )
              }
              className="w-[180px]"
            >
              <option value="all">Todas categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
              {filteredTransactions.length === 0 ? (
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
                          backgroundColor: `${CATEGORY_COLORS[transaction.category]}20`,
                          color: CATEGORY_COLORS[transaction.category],
                        }}
                      >
                        {transaction.category.charAt(0).toUpperCase() +
                          transaction.category.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.type === "income"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}R${" "}
                      {transaction.amount.toLocaleString("pt-BR")}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingId ? "Editar Transação" : "Nova Transação"}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {editingId
                  ? "Atualize os dados da transação"
                  : "Preencha os dados da transação"}
              </CardDescription>
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as TransactionType,
                      })
                    }
                    required
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as TransactionCategory,
                      })
                    }
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
              <div className="p-6 pt-0">
                <Button type="submit" className="w-full">
                  {editingId ? "Salvar Alterações" : "Adicionar Transação"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
