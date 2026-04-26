import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction, User } from "@/types";
import { api } from "@/lib/api";

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
  fetchTransactions: (params?: {
    pagina?: number;
    limite?: number;
    tipo?: "income" | "expense";
    categoriaId?: string;
    busca?: string;
  }) => Promise<void>;
  addTransaction: (data: {
    descricao: string;
    valor: number;
    tipo: "income" | "expense";
    categoriaId: string;
    data: string;
  }) => Promise<void>;
  updateTransaction: (
    id: string,
    data: Partial<{
      descricao: string;
      valor: number;
      tipo: "income" | "expense";
      categoriaId: string;
      data: string;
    }>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
}

function mapApiTransaction(apiTransacao: {
  id: string;
  descricao: string;
  valor: number;
  tipo: "RECEITA" | "DESPESA";
  data: string;
  categoriaId: string;
  usuarioId: string;
  criadoEm: string;
  atualizadoEm: string;
  categoria: {
    id: string;
    nome: string;
    cor: string;
    icone: string | null;
    tipo: "RECEITA" | "DESPESA";
    isPadrao: boolean;
    usuarioId: string | null;
    criadoEm: string;
  };
}): Transaction {
  return {
    id: apiTransacao.id,
    description: apiTransacao.descricao,
    amount: apiTransacao.valor,
    type: apiTransacao.tipo === "RECEITA" ? "income" : "expense",
    category: apiTransacao.categoria.nome.toLowerCase() as Transaction["category"],
    categoryId: apiTransacao.categoriaId,
    categoryName: apiTransacao.categoria.nome,
    categoryColor: apiTransacao.categoria.cor,
    date: apiTransacao.data,
    createdAt: apiTransacao.criadoEm,
    updatedAt: apiTransacao.atualizadoEm,
  };
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      error: null,
      pagination: {
        total: 0,
        pagina: 1,
        limite: 20,
        totalPaginas: 0,
      },

      fetchTransactions: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const apiParams: Record<string, string | number> = {};
          if (params?.pagina) apiParams.pagina = params.pagina;
          if (params?.limite) apiParams.limite = params.limite;
          if (params?.tipo) apiParams.tipo = params.tipo === "income" ? "RECEITA" : "DESPESA";
          if (params?.categoriaId) apiParams.categoriaId = params.categoriaId;
          if (params?.busca) apiParams.busca = params.busca;

          const response = await api.transacoes.listar(apiParams);

          set({
            transactions: response.items.map(mapApiTransaction),
            pagination: response.paginacao,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Erro ao buscar transações",
            isLoading: false,
          });
        }
      },

      addTransaction: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const apiData = {
            descricao: data.descricao,
            valor: data.valor,
            tipo: data.tipo === "income" ? "RECEITA" as const : "DESPESA" as const,
            categoriaId: data.categoriaId,
            data: new Date(data.data).toISOString(),
          };

          const response = await api.transacoes.criar(apiData);
          const newTransaction = mapApiTransaction({
            ...response,
            usuarioId: "",
          });

          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
            pagination: { ...state.pagination, total: state.pagination.total + 1 },
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Erro ao criar transação",
            isLoading: false,
          });
          throw error;
        }
      },

      updateTransaction: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const apiData: Record<string, unknown> = {};
          if (data.descricao) apiData.descricao = data.descricao;
          if (data.valor) apiData.valor = data.valor;
          if (data.tipo) apiData.tipo = data.tipo === "income" ? "RECEITA" : "DESPESA";
          if (data.categoriaId) apiData.categoriaId = data.categoriaId;
          if (data.data) apiData.data = new Date(data.data).toISOString();

          const response = await api.transacoes.atualizar(id, apiData);
          const updatedTransaction = mapApiTransaction({
            ...response,
            usuarioId: "",
          });

          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === id ? updatedTransaction : t
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Erro ao atualizar transação",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteTransaction: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await api.transacoes.deletar(id);
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
            pagination: { ...state.pagination, total: state.pagination.total - 1 },
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Erro ao deletar transação",
            isLoading: false,
          });
          throw error;
        }
      },

      getTransactionById: (id) => {
        return get().transactions.find((t) => t.id === id);
      },
    }),
    {
      name: "simplex-transactions",
      partialize: () => ({})
    }
  )
);

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  validateSession: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      validateSession: () => {
        const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

        if (!accessToken && !refreshToken) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        if (typeof window !== 'undefined') {
          window.addEventListener('session-expired', () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false });
          });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.auth.login({ email, senha: password });

          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);

          set({
            user: {
              id: response.usuario.id,
              name: response.usuario.nome,
              email: response.usuario.email,
            },
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Erro ao fazer login",
            isLoading: false,
          });
          return false;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.auth.registrar({ nome: name, email, senha: password });

          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);

          set({
            user: {
              id: response.usuario.id,
              name: response.usuario.nome,
              email: response.usuario.email,
            },
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Erro ao registrar",
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          api.auth.logout(refreshToken).catch(() => {});
        }
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, isAuthenticated: false });
      },

      setLoading: (loading) => set({ isLoading: loading }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "simplex-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "simplex-ui",
    }
  )
);

interface CategoryStore {
  categories: Array<{
    id: string;
    nome: string;
    cor: string;
    icone: string | null;
    tipo: "RECEITA" | "DESPESA";
    isPadrao: boolean;
  }>;
  isLoading: boolean;
  error: string | null;
  fetchCategories: (tipo?: "RECEITA" | "DESPESA") => Promise<void>;
  addCategory: (data: { nome: string; cor?: string; tipo: "RECEITA" | "DESPESA" }) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>()((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async (tipo) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.categorias.listar(tipo ? { tipo } : undefined);
      set({ categories: response, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Erro ao buscar categorias",
        isLoading: false,
      });
    }
  },

  addCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.categorias.criar(data);
      set((state) => ({
        categories: [...state.categories, response],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Erro ao criar categoria",
        isLoading: false,
      });
      throw error;
    }
  },
}));
