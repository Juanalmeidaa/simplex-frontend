import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Transaction, User } from "@/types";
import { mockTransactions } from "@/lib/mockData";

interface TransactionStore {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: mockTransactions,
      isLoading: false,
      addTransaction: (data) => {
        const now = new Date().toISOString();
        const newTransaction: Transaction = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));
      },
      updateTransaction: (id, data) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },
      getTransactionById: (id) => {
        return get().transactions.find((t) => t.id === id);
      },
    }),
    {
      name: "simplex-transactions",
    }
  )
);

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (email && password) {
          set({
            user: {
              id: "1",
              name: email.split("@")[0],
              email,
            },
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        }
        set({ isLoading: false });
        return false;
      },
      register: async (name, email, password) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (name && email && password) {
          set({
            user: {
              id: crypto.randomUUID(),
              name,
              email,
            },
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        }
        set({ isLoading: false });
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "simplex-auth",
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
