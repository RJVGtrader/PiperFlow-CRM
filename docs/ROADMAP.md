# Roadmap de Execução — PipeFlow CRM

Plano de execução do projeto dividido em milestones, do setup ao deploy. Estratégia: **construir a interface (UI, com dados mockados) primeiro, depois conectar o backend (Supabase, Stripe, Resend)** milestone a milestone, sobre o schema/design definidos em [CLAUDE.md](../CLAUDE.md) e [PRD.md](PRD.md).

Cada milestone: branch dedicada a partir de `main`, merge via PR ao final, commit(s) fechando a entrega.

---

## M0 — Setup do Projeto

**Branch:** `chore/project-setup`

**Objetivo:** Inicializar o projeto com a stack definida e a estrutura de pastas do CLAUDE.md, sem nenhuma feature ainda.

**Entregas:**
- [x] Projeto Next.js 14 (App Router) + TypeScript 5 (strict)
- [x] Tailwind CSS configurado
- [x] shadcn/ui inicializado (tema base)
- [x] Estrutura de pastas (`app/`, `components/`, `lib/`, `types/`, `docs/`)
- [x] ESLint + Prettier configurados
- [x] Projeto Supabase criado e linkado (env vars locais)
- [x] Projeto Vercel criado e linkado
- [x] README com instruções de setup local

**Commit final:** `chore: setup inicial do projeto Next.js + Tailwind + shadcn/ui`

---

## M1 — Landing Page (UI)

**Branch:** `feature/landing-page-ui`

**Objetivo:** Construir a landing page pública, 100% estática.

**Entregas:**
- [x] Seção Hero
- [x] Seção de Funcionalidades
- [x] Seção de Planos e Preços (Free / Pro — estática)
- [x] Seção de CTA final + footer
- [x] Responsivo (mobile / desktop)

**Commit final:** `feat: landing page pública`

---

## M2 — UI de Autenticação e Onboarding

**Branch:** `feature/auth-ui`

**Objetivo:** Telas de login, cadastro e onboarding, sem lógica de autenticação real (formulários funcionais visualmente, submit mockado).

**Entregas:**
- [ ] Tela de login
- [ ] Tela de cadastro (signup)
- [ ] Fluxo de onboarding: criação do primeiro workspace
- [ ] Estados de erro/validação de formulário (UI)

**Commit final:** `feat: UI de autenticação e onboarding`

---

## M3 — Shell do Dashboard Autenticado (UI)

**Branch:** `feature/dashboard-shell-ui`

**Objetivo:** Layout da área autenticada com dados mockados: sidebar, navegação e troca de workspace.

**Entregas:**
- [ ] Layout `(dashboard)` com sidebar e topbar
- [ ] Dropdown de troca de workspace (mock)
- [ ] Navegação entre Leads / Pipeline / Dashboard / Settings
- [ ] Estados vazios e loading skeletons padrão

**Commit final:** `feat: shell do dashboard autenticado`

---

## M4 — UI de Gestão de Leads

**Branch:** `feature/leads-ui`

**Objetivo:** Telas de leads com dados mockados.

**Entregas:**
- [ ] Tabela de leads com busca e filtros (status, responsável, data)
- [ ] Formulário de criação/edição de lead (nome, e-mail, telefone, empresa, cargo, status)
- [ ] Página de detalhe do lead
- [ ] Timeline de atividades na página de detalhe (UI, mock)

**Commit final:** `feat: UI de gestão de leads e contatos`

---

## M5 — UI do Pipeline Kanban

**Branch:** `feature/pipeline-ui`

**Objetivo:** Board Kanban funcional em memória, com drag-and-drop via @dnd-kit, sem persistência.

**Entregas:**
- [ ] Colunas por etapa (Novo Lead → Contato Realizado → Proposta Enviada → Negociação → Fechado Ganho / Fechado Perdido)
- [ ] Cards de negócio (título, valor estimado, lead vinculado, responsável, prazo)
- [ ] Drag-and-drop entre colunas (estado local)
- [ ] Formulário de criação/edição de negócio

**Commit final:** `feat: UI do pipeline Kanban com drag-and-drop`

---

## M6 — UI do Dashboard de Métricas

**Branch:** `feature/metrics-dashboard-ui`

**Objetivo:** Cards de métricas e gráfico de funil com dados mockados.

**Entregas:**
- [ ] Cards: total de leads, negócios abertos, valor total do pipeline, taxa de conversão
- [ ] Gráfico de funil de vendas (Recharts, dados mock)
- [ ] Lista de negócios do usuário logado com prazo próximo

**Commit final:** `feat: UI do dashboard de métricas`

---

## M7 — UI de Settings (Workspace, Membros, Billing)

**Branch:** `feature/settings-ui`

**Objetivo:** Telas de configuração do workspace com dados mockados.

**Entregas:**
- [ ] Tela de dados do workspace (nome, etc.)
- [ ] Lista de membros + formulário de convite por e-mail (mock)
- [ ] Tela de plano/billing (Free vs Pro, mock)

**Commit final:** `feat: UI de settings do workspace`

---

## M8 — Schema do Banco + RLS (Supabase)

**Branch:** `feature/supabase-schema`

**Objetivo:** Modelar o banco multi-tenant com isolamento por Row Level Security. Fim da fase de UI, início da fase de backend.

**Entregas:**
- [ ] Migrations: `workspaces`, `workspace_members`, `leads`, `deals`, `activities`, `subscriptions`
- [ ] Policies RLS por `workspace_id` e `role` (admin/membro)
- [ ] Geração de tipos TypeScript (`supabase gen types`)
- [ ] Seed de dados de teste

**Commit final:** `feat: schema do banco e RLS multi-tenant`

---

## M9 — Autenticação e Workspaces Reais

**Branch:** `feature/auth-workspaces-backend`

**Objetivo:** Conectar as telas de auth (M2) e o workspace switcher (M3/M7) ao Supabase Auth e ao banco real.

**Entregas:**
- [ ] Login/cadastro funcionais via Supabase Auth
- [ ] Middleware de proteção de rotas autenticadas
- [ ] Criação de workspace real no onboarding
- [ ] Convite de colaborador por e-mail via Resend + tela de aceite
- [ ] Troca de workspace ligada ao banco (papéis admin/membro)

**Commit final:** `feat: autenticação e workspaces integrados ao Supabase`

---

## M10 — Backend de Leads

**Branch:** `feature/leads-backend`

**Objetivo:** Ligar a UI de leads (M4) a Server Actions e ao banco.

**Entregas:**
- [ ] Server Actions: criar, editar, excluir lead
- [ ] Busca e filtros com query real no Supabase
- [ ] Página de detalhe com dados reais

**Commit final:** `feat: CRUD de leads integrado ao Supabase`

---

## M11 — Backend do Pipeline e Atividades

**Branch:** `feature/pipeline-backend`

**Objetivo:** Persistir negócios, movimentação de etapa no Kanban (M5) e atividades (timeline do M4).

**Entregas:**
- [ ] Server Actions: criar/editar negócio
- [ ] Persistência da etapa ao mover card no drag-and-drop
- [ ] Registro real de atividades (ligação, e-mail, reunião, nota)
- [ ] Timeline do lead com dados reais

**Commit final:** `feat: pipeline e atividades integrados ao Supabase`

---

## M12 — Backend do Dashboard de Métricas

**Branch:** `feature/metrics-dashboard-backend`

**Objetivo:** Substituir os dados mock do M6 por queries reais.

**Entregas:**
- [ ] Queries: total de leads, negócios abertos, valor total do pipeline, taxa de conversão
- [ ] Gráfico de funil com dados reais
- [ ] Negócios com prazo próximo (query real, escopada ao usuário logado)

**Commit final:** `feat: dashboard de métricas com dados reais`

---

## M13 — Monetização (Stripe)

**Branch:** `feature/stripe-billing`

**Objetivo:** Conectar a tela de billing (M7) ao Stripe e aplicar limites de plano.

**Entregas:**
- [ ] Stripe Checkout para upgrade Free → Pro
- [ ] Webhook do Stripe para ativar/desativar plano automaticamente
- [ ] Customer Portal para gerenciamento de assinatura
- [ ] Enforcement dos limites do Free (2 colaboradores, 50 leads)

**Commit final:** `feat: monetização via Stripe`

---

## M14 — Permissões, Erros e Polish

**Branch:** `feature/permissions-polish`

**Objetivo:** Revisão transversal de toda a aplicação antes do deploy.

**Entregas:**
- [ ] Checagem de permissões admin/membro em todas as ações sensíveis (frontend + policies)
- [ ] Tratamento de erros e mensagens de feedback (toasts, estados de erro)
- [ ] Revisão de responsividade e acessibilidade
- [ ] Teste manual de ponta a ponta de todos os fluxos do PRD

**Commit final:** `fix: revisão de permissões, tratamento de erros e polish geral`

---

## M15 — Deploy

**Branch:** `chore/deploy`

**Objetivo:** Publicar a aplicação em produção.

**Entregas:**
- [ ] Env vars de produção configuradas (Vercel, Supabase, Stripe, Resend)
- [ ] Migrations aplicadas no projeto Supabase de produção
- [ ] Deploy de produção na Vercel
- [ ] Domínio configurado
- [ ] Webhook do Stripe apontando para produção
- [ ] Smoke test dos fluxos críticos em produção

**Commit final:** `chore: deploy em produção`
