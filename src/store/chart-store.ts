import { create } from "zustand";
import { api } from "@/lib/api";
import type { CategoryData, MonthlyData, CategoryStatistics, MonthlyStatistics } from "@/types";

interface ChartStore {
  categoryData: CategoryData[];
  monthlyData: MonthlyData[];
  isLoading: boolean;
  error: string | null;

  fetchCategoryStatistics: (tipo: "income" | "expense", mes?: number, ano?: number) => Promise<void>;
  fetchMonthlyStatistics: (meses?: number) => Promise<void>;
}

function mapToCategoryData(estatisticas: CategoryStatistics[]): CategoryData[] {
  return estatisticas.map((stat) => ({
    id: stat.categoriaId,
    name: stat.categoriaNome,
    value: Number(stat.total),
    color: stat.categoriaCor,
  }));
}

function mapToMonthlyData(estatisticas: MonthlyStatistics[]): MonthlyData[] {
  return estatisticas.map((stat) => ({
    month: stat.nomeMes,
    income: Number(stat.totalReceitas),
    expense: Number(stat.totalDespesas),
    balance: Number(stat.totalReceitas) - Number(stat.totalDespesas),
  }));
}

export const useChartStore = create<ChartStore>()((set) => ({
  categoryData: [],
  monthlyData: [],
  isLoading: false,
  error: null,

  fetchCategoryStatistics: async (tipo, mes, ano) => {
    set({ isLoading: true, error: null });
    try {
      const apiTipo = tipo === "income" ? "RECEITA" : "DESPESA";
      const estatisticas = await api.transacoes.estatisticasPorCategoria({
        tipo: apiTipo,
        mes,
        ano,
      });

      set({
        categoryData: mapToCategoryData(estatisticas),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Erro ao buscar estatísticas de categorias",
        isLoading: false,
      });
    }
  },

  fetchMonthlyStatistics: async (meses = 6) => {
    set({ isLoading: true, error: null });
    try {
      const estatisticas = await api.transacoes.estatisticasMensais({ meses });

      set({
        monthlyData: mapToMonthlyData(estatisticas),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Erro ao buscar estatísticas mensais",
        isLoading: false,
      });
    }
  },
}));
