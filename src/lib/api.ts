const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface RequestConfig {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  skipAuth?: boolean;
}

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.dispatchEvent(new Event('session-expired'));
    window.location.href = '/login';
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  config: RequestConfig = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && !config.skipAuth && { Authorization: `Bearer ${token}` }),
      ...config.headers,
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return {} as T;
  }

  if (response.status === 401 && !config.skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      const newToken = localStorage.getItem('accessToken');
      const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...config.headers,
          ...options.headers,
        },
      });

      if (retryResponse.ok) {
        const data = await retryResponse.json();
        return data.data ?? data;
      }

      if (retryResponse.status === 401) {
        redirectToLogin();
        throw new ApiError('Sessão expirada', 401);
      }
    } else {
      redirectToLogin();
      throw new ApiError('Sessão expirada', 401);
    }
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      `Erro do servidor: ${response.status} ${response.statusText}`,
      response.status
    );
  }

  if (!response.ok) {
    throw new ApiError(
      data?.mensagem || 'Erro na requisição',
      response.status,
      data?.codigo,
      data?.erros
    );
  }

  return data.data ?? data;
}

export const api = {
  auth: {
    registrar: (data: { nome: string; email: string; senha: string }) =>
      request<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        usuario: {
          id: string;
          nome: string;
          email: string;
          criadoEm: string;
        };
      }>('/auth/registrar', {
        method: 'POST',
        body: JSON.stringify(data),
      }, { skipAuth: true }),

    login: (data: { email: string; senha: string }) =>
      request<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        usuario: {
          id: string;
          nome: string;
          email: string;
          criadoEm: string;
        };
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }, { skipAuth: true }),

    refresh: (refreshToken: string) =>
      request<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }, { skipAuth: true }),

    logout: (refreshToken: string) =>
      request<void>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }, { skipAuth: true }),
  },

  usuarios: {
    perfil: () =>
      request<{
        id: string;
        nome: string;
        email: string;
        criadoEm: string;
      }>('/usuarios/me'),

    atualizarPerfil: (data: { nome?: string }) =>
      request<{
        id: string;
        nome: string;
        email: string;
        criadoEm: string;
      }>('/usuarios/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    alterarSenha: (data: { senhaAtual: string; novaSenha: string }) =>
      request<void>('/usuarios/me/senha', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  categorias: {
    listar: (params?: { tipo?: 'RECEITA' | 'DESPESA' }) => {
      const query = params ? '?' + new URLSearchParams(params as Record<string, string>) : '';
      return request<
        Array<{
          id: string;
          nome: string;
          cor: string;
          icone: string | null;
          tipo: 'RECEITA' | 'DESPESA';
          isPadrao: boolean;
          usuarioId: string | null;
          criadoEm: string;
        }>
      >(`/categorias${query}`);
    },

    criar: (data: { nome: string; cor?: string; icone?: string; tipo: 'RECEITA' | 'DESPESA' }) =>
      request<{
        id: string;
        nome: string;
        cor: string;
        icone: string | null;
        tipo: 'RECEITA' | 'DESPESA';
        isPadrao: boolean;
        usuarioId: string | null;
        criadoEm: string;
      }>('/categorias', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    atualizar: (
      id: string,
      data: { nome?: string; cor?: string; icone?: string }
    ) =>
      request<{
        id: string;
        nome: string;
        cor: string;
        icone: string | null;
        tipo: 'RECEITA' | 'DESPESA';
        isPadrao: boolean;
        usuarioId: string | null;
        criadoEm: string;
      }>(`/categorias/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deletar: (id: string) =>
      request<void>(`/categorias/${id}`, { method: 'DELETE' }),
  },

  transacoes: {
    listar: (params?: {
      pagina?: number;
      limite?: number;
      tipo?: 'RECEITA' | 'DESPESA';
      categoriaId?: string;
      dataInicio?: string;
      dataFim?: string;
      busca?: string;
    }) => {
      const query = params ? '?' + new URLSearchParams(params as Record<string, string>) : '';
      return request<{
        items: Array<{
          id: string;
          descricao: string;
          valor: number;
          tipo: 'RECEITA' | 'DESPESA';
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
            tipo: 'RECEITA' | 'DESPESA';
            isPadrao: boolean;
            usuarioId: string | null;
            criadoEm: string;
          };
        }>;
        paginacao: {
          total: number;
          pagina: number;
          limite: number;
          totalPaginas: number;
          hasProximaPagina: boolean;
          hasPaginaAnterior: boolean;
        };
      }>(`/transacoes${query}`);
    },

    estatisticas: (params?: { mes?: number; ano?: number }) => {
      const query = params ? '?' + new URLSearchParams(params as Record<string, string>) : '';
      return request<{
        totalReceitas: number;
        totalDespesas: number;
      }>(`/transacoes/estatisticas${query}`);
    },

    estatisticasPorCategoria: (params: { tipo: 'RECEITA' | 'DESPESA'; mes?: number; ano?: number }) => {
      const query = '?' + new URLSearchParams({
        tipo: params.tipo,
        ...(params.mes && { mes: params.mes.toString() }),
        ...(params.ano && { ano: params.ano.toString() }),
      });
      return request<
        Array<{
          categoriaId: string;
          categoriaNome: string;
          categoriaCor: string;
          total: number;
        }>
      >(`/transacoes/estatisticas/categorias${query}`);
    },

    estatisticasMensais: (params?: { meses?: number }) => {
      const query = params?.meses ? '?' + new URLSearchParams({ meses: params.meses.toString() }) : '';
      return request<
        Array<{
          mes: number;
          ano: number;
          nomeMes: string;
          totalReceitas: number;
          totalDespesas: number;
        }>
      >(`/transacoes/estatisticas/mensais${query}`);
    },

    criar: (data: {
      descricao: string;
      valor: number;
      tipo: 'RECEITA' | 'DESPESA';
      categoriaId: string;
      data: string;
    }) =>
      request<{
        id: string;
        descricao: string;
        valor: number;
        tipo: 'RECEITA' | 'DESPESA';
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
          tipo: 'RECEITA' | 'DESPESA';
          isPadrao: boolean;
          usuarioId: string | null;
          criadoEm: string;
        };
      }>('/transacoes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    atualizar: (
      id: string,
      data: {
        descricao?: string;
        valor?: number;
        tipo?: 'RECEITA' | 'DESPESA';
        categoriaId?: string;
        data?: string;
      }
    ) =>
      request<{
        id: string;
        descricao: string;
        valor: number;
        tipo: 'RECEITA' | 'DESPESA';
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
          tipo: 'RECEITA' | 'DESPESA';
          isPadrao: boolean;
          usuarioId: string | null;
          criadoEm: string;
        };
      }>(`/transacoes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    deletar: (id: string) =>
      request<void>(`/transacoes/${id}`, { method: 'DELETE' }),
  },
};

export { ApiError };
export default api;
