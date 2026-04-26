import { create } from "zustand";
import { api } from "@/lib/api";
import type { CategoryData, MonthlyData } from "@/types";

interface DashboardStore {
  categoryData: CategoryData[];
  monthlyData: MonthlyData[];
  statistics: {
    totalReceitas: number;
    totalDespesas: number;
  };
  isLoading: boolean;
  error: string | null;

  fetchDashboardData: (meses?: number) => Promise<void>;
}

function mapToCategoryData(estatisticas: { categoriaId: string; categoriaNome: string; categoriaCor: string; total: number }[]): CategoryData[] {
  return estatisticas.map((stat) => ({
    id: stat.categoriaId,
    name: stat.categoriaNome,
    value: Number(stat.total),
    color: stat.categoriaCor,
  }));
}

function mapToMonthlyData(estatisticas: { nomeMes: string; totalReceitas: number; totalDespesas: number }[]): MonthlyData[] {
  return estatisticas.map((stat) => ({
    month: stat.nomeMes,
    income: Number(stat.totalReceitas) || 0,
    expense: Number(stat.totalDespesas) || 0,
    balance: (Number(stat.totalReceitas) || 0) - (Number(stat.totalDespesas) || 0),
  }));
}

export const useDashboardStore = create<DashboardStore>()((set) => ({
  categoryData: [],
  monthlyData: [],
  statistics: {
    totalReceitas: 0,
    totalDespesas: 0,
  },
  isLoading: false,
  error: null,

  fetchDashboardData: async (meses = 6) => {
    set({ isLoading: true, error: null });

    try {
      const [monthlyResponse, categoryResponse, statisticsResponse] = await Promise.allSettled([
        api.transacoes.estatisticasMensais({ meses }),
        api.transacoes.estatisticasPorCategoria({ tipo: "DESPESA" }),
        api.transacoes.estatisticas(),
      ]);

      const monthlyData = monthlyResponse.status === 'fulfilled' ? mapToMonthlyData(monthlyResponse.value) : [];
      const categoryData = categoryResponse.status === 'fulfilled' ? mapToCategoryData(categoryResponse.value) : [];
      const statistics = statisticsResponse.status === 'fulfilled' 
        ? { totalReceitas: Number(statisticsResponse.value.totalReceitas) || 0, totalDespesas: Number(statisticsResponse.value.totalDespesas) || 0 }
        : { totalReceitas: 0, totalDespesas: 0 };

      set({
        monthlyData,
        categoryData,
        statistics,
        isLoading: false,
        error: monthlyData.length === 0 && categoryData.length === 0 && statistics.totalReceitas === 0 && statistics.totalDespesas === 0
          ? "Nenhum dado encontrado. Cadastre suas transações para ver o dashboard."
          : null,
      });
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      set({
        error: error instanceof Error ? error.message : "Erro ao buscar dados do dashboard",
        isLoading: false,
      });
    }
  },
}));
