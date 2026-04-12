# Simplex - Sistema de Controle Financeiro

Sistema SaaS simplificado para controle financeiro pessoal com gráficos e projeções.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: shadcn/ui + Radix UI
- **Gráficos**: Recharts
- **State Management**: Zustand
- **Persistência**: localStorage

## Estrutura do Projeto

```
simplex/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rotas de autenticação
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # Rotas protegidas
│   │   │   ├── dashboard/
│   │   │   ├── transacoes/
│   │   │   ├── relatorios/
│   │   │   └── configuracoes/
│   │   ├── api/               # API Routes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # Componentes base
│   │   ├── charts/            # Componentes de gráficos
│   │   ├── forms/             # Formulários
│   │   └── layout/            # Header, Sidebar
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilitários e dados mock
│   ├── services/              # Chamadas API
│   ├── store/                 # Zustand stores
│   ├── types/                 # Tipos TypeScript
│   └── styles/                # Estilos globais
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Instalação

```bash
cd simplex
npm install
```

## Executar

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## Funcionalidades

### Fase 1 - Setup ✅
- [x] Configuração do projeto
- [x] Estrutura de pastas
- [x] Tipos TypeScript
- [x] Store com Zustand
- [x] Dados mock

### Fase 2 - Autenticação ✅
- [x] Página de Login
- [x] Página de Registro
- [x] Proteção de rotas

### Fase 3 - Dashboard ✅
- [x] Layout com Sidebar + Header
- [x] Cards de resumo (saldo, receitas, despesas)
- [x] Gráfico de despesas por categoria
- [x] Gráfico mensal de receitas/despesas
- [x] Últimas transações
- [x] Dicas de economia

### Fase 4 - Transações ✅
- [x] Lista de transações
- [x] Filtros (busca, tipo, categoria)
- [x] CRUD completo (modal)
- [x] Badges coloridas por categoria

### Fase 5 - Relatórios ✅
- [x] Métricas financeiras
- [x] Projeção de gastos futuros
- [x] Recomendações personalizadas

### Fase 6 - Configurações ✅
- [x] Perfil do usuário
- [x] Notificações
- [x] Segurança
- [x] Aparência

## Próximas Fases

- [ ] Integração com backend real
- [ ] Autenticação via Google/GitHub
- [ ] Exportar dados (PDF, Excel)
- [ ] Metas de economia
- [ ] Multi-moeda
- [ ] Temas claro/escuro
- [ ] Responsividade mobile

## Dados Mock

O projeto já vem com dados mockados para demonstração:
- 10 transações de exemplo
- Categorias: salário, freelance, investimento, alimentação, moradia, etc.
- Período: Janeiro 2024

## Login de Demonstração

Use qualquer email e senha para fazer login (o sistema é mockado).
