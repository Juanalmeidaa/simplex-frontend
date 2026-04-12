# Arquitetura do Simplex

Sistema SaaS simplificado para controle financeiro pessoal com gráficos e projeções.

---

## 1. Visão Geral

### 1.1 Stack Tecnológica

| Tecnologia | Propósito |
|------------|-----------|
| Next.js 14 | Framework React com App Router |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilização utility-first |
| shadcn/ui + Radix UI | Componentes acessíveis |
| Recharts | Gráficos financeiros |
| Zustand | Gerenciamento de estado |
| localStorage | Persistência de dados |

### 1.2 Convenções de Código

- **Commits semânticos**: Sem comentários desnecessários no código
- **Nomenclatura em português**: Arquivos e variáveis em português (transações, relatórios)
- **Componentes funcionais**: Apenas functional components com hooks
- **CSS com variáveis HSL**: Cores definidas via CSS custom properties

---

## 2. Estrutura de Pastas

```
simplex/
├── src/
│   ├── app/                    # App Router do Next.js
│   │   ├── (auth)/            # Grupo de rotas - autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Grupo de rotas - protegidas
│   │   │   ├── dashboard/
│   │   │   ├── transacoes/
│   │   │   ├── relatorios/
│   │   │   └── configuracoes/
│   │   └── layout.tsx         # Layout raiz
│   │
│   ├── components/
│   │   ├── ui/                # Componentes base (Button, Card, Input)
│   │   ├── charts/            # Gráficos (ExpenseChart, MonthlyChart)
│   │   └── layout/            # Header, Sidebar
│   │
│   ├── store/                 # Zustand stores
│   ├── lib/                   # Utilitários e dados mock
│   ├── types/                 # Definições TypeScript
│   └── styles/                # CSS global (vars de tema)
│
├── tailwind.config.ts         # Configuração do Tailwind
└── package.json
```

---

## 3. Design System

### 3.1 Paleta de Cores (Tema Roxo)

```css
/* Tema Claro */
--primary: 270 70% 45%;        /* Roxo #7c3aed */
--primary-foreground: 0 0% 100%; /* Branco */
--background: 0 0% 99%;
--foreground: 270 50% 10%;
--secondary: 270 30% 96%;
--accent: 270 60% 50%;
--border: 270 15% 88%;
--destructive: 0 84.2% 60.2%;   /* Vermelho */

/* Tema Escuro */
--primary: 270 80% 60%;
--background: 270 40% 6%;
--foreground: 0 0% 98%;
--secondary: 270 25% 15%;
--card: 270 35% 10%;
```

### 3.2 Tipografia

- **Font**: Sistema native (sem Google Fonts configurada)
- **Tamanhos**: `text-xs` (12px), `text-sm` (14px), `text-lg` (18px), `text-xl` (20px+)
- **Peso**: `font-medium` (500), `font-semibold` (600), `font-bold` (700)

### 3.3 Espaçamento

- **Border-radius**: `0.75rem` (12px) para cards, `0.5rem` (8px) para inputs
- **Padding padrão**: `p-6` (24px) para páginas, `p-4` (16px) para cards internos
- **Gap entre elementos**: `gap-4` (16px), `gap-6` (24px)

---

## 4. Componentes

### 4.1 Sidebar (`components/layout/sidebar.tsx`)

**Propósito**: Navegação principal da aplicação.

**Estados**:
- Aberto (w-64): mostra ícones + labels
- Fechado (w-20): mostra apenas ícones

**Funcionalidades**:
- Toggle com animação suave (200ms ease-out)
- Indicador de rota ativa (bg-primary)
- Persistência do estado via Zustand + localStorage

**Estrutura**:
```
Sidebar
├── Logo (Wallet + "Simplex")
├── NavItems[]
│   ├── Dashboard (LayoutDashboard)
│   ├── Transações (Receipt)
│   ├── Relatórios (PieChart)
│   └── Configurações (Settings)
└── Toggle Button (ChevronLeft/Right)
```

### 4.2 Header (`components/layout/header.tsx`)

**Propósito**: Barra superior com saudação e ações do usuário.

**Elementos**:
- Label "Dashboard" (uppercase, tracking-wide)
- Saudação personalizada com nome do usuário
- Data atual formatada em português
- Indicador de notificações (dot)
- Avatar com dropdown do usuário

**Funcionalidades**:
- Logout via dropdown menu
- Ajuste de posição baseado no estado da sidebar

### 4.3 Cards (`components/ui/card.tsx`)

**Propósito**: Container para agrupar informações relacionadas.

**Variantes visuais**:
- Sem variant específica: fundo branco/transparente
- Com hover: `hover:shadow-md transition-shadow`

---

## 5. Store (Zustand)

### 5.1 AuthStore

```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email, password) => Promise<boolean>;
  register: (name, email, password) => Promise<boolean>;
  logout: () => void;
}
```

**Persistência**: `localStorage` com key `simplex-auth`

**Observações**:
- Autenticação mockada (aceita qualquer credencial válida)
- Nome do usuário extraído do email (`email.split("@")[0]`)

### 5.2 TransactionStore

```typescript
interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (data) => void;
  updateTransaction: (id, data) => void;
  deleteTransaction: (id) => void;
  getTransactionById: (id) => Transaction;
}
```

**Persistência**: `localStorage` com key `simplex-transactions`

**Tipo Transaction**:
```typescript
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
```

### 5.3 UIStore

```typescript
interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open) => void;
}
```

**Persistência**: `localStorage` com key `simplex-ui`

**Valor inicial**: `sidebarOpen: true`

---

## 6. Páginas

### 6.1 Dashboard (`/dashboard`)

**Componentes**:
- Cards de resumo (Saldo, Receitas, Despesas)
- ExpenseChart (gráfico de pizza por categoria)
- MonthlyChart (gráfico de barras mensal)
- Lista de últimas transações
- Dicas de economia

### 6.2 Transações (`/transacoes`)

**Funcionalidades**:
- Lista com filtros (busca, tipo, categoria)
- Modal de CRUD para criar/editar/excluir
- Badges coloridas por categoria

### 6.3 Relatórios (`/relatorios`)

**Componentes**:
- Métricas financeiras (totais, médias)
- ProjectionChart (projeção futura)
- Recomendações personalizadas

### 6.4 Configurações (`/configuracoes`)

**Seções**:
- Perfil (nome, email)
- Notificações (toggles)
- Segurança (alterar senha, 2FA)
- Aparência (tema, moeda)

### 6.5 Login/Register (`/login`, `/register`)

**Funcionalidades**:
- Validação de formulários
- Loading state durante autenticação
- Redirecionamento para dashboard após login

---

## 7. Fluxo de Dados

### 7.1 Autenticação

```
User Access → /login
     ↓
Form Submit → useAuthStore.login()
     ↓
Mock Validation (email + password OK)
     ↓
Set user + isAuthenticated: true
     ↓
localStorage.update('simplex-auth')
     ↓
Router.push('/dashboard')
```

### 7.2 Proteção de Rotas

```
User Access → /dashboard
     ↓
useAuthStore.isAuthenticated?
     ↓
Não → Router.push('/login')
     ↓
Sim → Render Dashboard
```

---

## 8. Decisões Técnicas

### 8.1 Dados Mockados

O sistema utiliza dados de exemplo em `lib/mockData.ts`:
- 10 transações pré-definidas
- Categorias: salário, freelance, investimento, alimentação, moradia, transporte, lazer
- Período: Janeiro 2024

### 8.2 Animações

Todas as transições usam:
- **Duração**: 200ms
- **Easing**: `ease-out`
- **Propriedade otimizada**: `width` (não `all`)

### 8.3 Responsividade

- Sidebar colapsável para mobile (em implementação)
- Breakpoints padrão do Tailwind: sm, md, lg

---

## 9. Funcionalidades Implementadas

### Fase 1 - Setup
- [x] Configuração do projeto
- [x] Estrutura de pastas
- [x] Tipos TypeScript
- [x] Store com Zustand
- [x] Dados mock

### Fase 2 - Autenticação
- [x] Página de Login
- [x] Página de Registro
- [x] Proteção de rotas

### Fase 3 - Dashboard
- [x] Layout com Sidebar + Header
- [x] Cards de resumo
- [x] Gráfico de despesas por categoria
- [x] Gráfico mensal de receitas/despesas
- [x] Últimas transações
- [x] Dicas de economia

### Fase 4 - Transações
- [x] Lista de transações
- [x] Filtros (busca, tipo, categoria)
- [x] CRUD completo (modal)
- [x] Badges coloridas por categoria

### Fase 5 - Relatórios
- [x] Métricas financeiras
- [x] Projeção de gastos futuros
- [x] Recomendações personalizadas

### Fase 6 - Configurações
- [x] Perfil do usuário
- [x] Notificações
- [x] Segurança
- [x] Aparência

### Fase 7 - Design
- [x] Tema roxo implementado
- [x] Header sofisticado
- [x] Animações otimizadas

---

## 10. Próximos Passos

- [ ] Integração com backend real
- [ ] Autenticação via Google/GitHub
- [ ] Exportar dados (PDF, Excel)
- [ ] Metas de economia
- [ ] Multi-moeda
- [ ] Temas claro/escuro
- [ ] Responsividade mobile
- [ ] Testes unitários

---

## 11. Comandos Úteis

```bash
# Instalar dependências
npm install

# Development
npm run dev

# Build produção
npm run build

# Lint
npm run lint
```

---

*Última atualização: 12/04/2026*
