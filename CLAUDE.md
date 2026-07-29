# PipeFlow CRM

CRM SaaS multi-empresa com pipeline Kanban de vendas, gestão de leads/negócios, registro de atividades e monetização via assinatura (Stripe). Público-alvo: PMEs, freelancers/consultores e times de vendas que hoje usam planilhas em vez de um CRM. Especificação completa do produto em [docs/PRD.md](docs/PRD.md).

## Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript 5 (strict)
- **UI**: Tailwind CSS + shadcn/ui
- **Dados/Auth**: Supabase (PostgreSQL + Row Level Security + Auth)
- **Pagamentos**: Stripe (Checkout + Customer Portal + Webhooks)
- **E-mail transacional**: Resend
- **Drag-and-drop**: @dnd-kit
- **Gráficos**: Recharts
- **Deploy**: Vercel (app) + Supabase (banco)

## Estrutura de pastas

```
app/
  (marketing)/            # landing page pública (hero, features, pricing, CTA)
  (auth)/                 # login, signup, callback
  (dashboard)/            # área autenticada, escopada por workspace ativo
    leads/                # listagem + detalhe de leads (timeline de atividades)
    pipeline/             # board Kanban de negócios
    dashboard/             # métricas e gráfico de funil
    settings/               # workspace, membros/convites, billing
  api/
    webhooks/stripe/        # webhook de assinatura
    invites/                 # convite de colaboradores
components/
  ui/                       # primitivos shadcn (não editar à mão, usar CLI)
  kanban/                    # board, colunas, cards de negócio
  leads/                     # formulários, tabela, timeline
  dashboard/                 # cards de métrica, gráfico de funil
lib/
  supabase/                  # client (browser) e server client, tipos gerados
  stripe/                    # client Stripe, helpers de checkout/portal
  email/                     # templates e envio via Resend
types/                       # tipos compartilhados (Lead, Deal, Activity, Workspace...)
docs/
  PRD.md
```

## Convenções

- **Server Components por padrão.** Só usar `"use client"` quando houver interatividade (drag-and-drop, formulários controlados, dropdowns).
- **Server Actions** para mutações (criar lead, mover card no pipeline, registrar atividade, convidar membro) em vez de API routes, exceto para webhooks e endpoints que precisam ser chamados externamente (Stripe, integrações).
- **Multi-tenant por `workspace_id`**: toda tabela de domínio (leads, deals, activities) tem `workspace_id`. Isolamento é garantido via RLS no Supabase, nunca só por filtro no client — a policy é a linha de defesa real.
- **Roles**: `admin` e `membro`, checados via policy no Supabase (não confiar em checagem só no frontend).
- Componentes shadcn/ui são adicionados via CLI (`npx shadcn add ...`), não escritos manualmente do zero.
- Nomes de arquivo/pasta em kebab-case; componentes React em PascalCase.
- Commits pequenos e descritivos, por milestone/feature.

## Modelo de dados (alto nível)

- `workspaces` — 1 por empresa/time
- `workspace_members` — usuário + workspace + role (admin/membro)
- `leads` — nome, e-mail, telefone, empresa, cargo, status, workspace_id
- `deals` — título, valor, etapa do funil, lead_id, responsável, prazo, workspace_id
- `activities` — tipo (ligação/e-mail/reunião/nota), autor, descrição, data, lead_id
- `subscriptions` — plano (free/pro), stripe_customer_id, stripe_subscription_id, workspace_id

Etapas do pipeline (`deals.stage`): Novo Lead → Contato Realizado → Proposta Enviada → Negociação → Fechado Ganho / Fechado Perdido.

## Identidade visual

Referências: HubSpot CRM e Pipedrive — mas mais simples e focado só em vendas (sem a complexidade de automação de marketing da HubSpot).

- Base em tokens shadcn/ui (Tailwind + CSS variables), paleta neutra (cinzas/brancos) com uma cor de destaque (accent) para CTAs, botões primários e estados ativos.
- Tipografia sans-serif de sistema, hierarquia clara entre título/label/valor nos cards de métrica.
- Kanban: uma cor sutil por etapa do funil, com destaque visual maior para "Fechado Ganho" (positivo) e "Fechado Perdido" (neutro/negativo).
- Densidade média: tabelas e cards compactos o bastante para leitura rápida (referência Pipedrive), sem poluição visual.
- Landing page com seções claras: Hero → Funcionalidades → Planos e Preços → CTA final.

## Milestones de build

Seguir o PRD (seção 7): construir em incrementos entregáveis, priorizando core antes de polish. Ordem sugerida:

1. Auth + workspaces (criação, convite, troca de workspace) com RLS
2. CRUD de leads (listagem, busca/filtros, detalhe)
3. Pipeline Kanban (colunas, cards, drag-and-drop com persistência)
4. Registro de atividades + timeline no lead
5. Dashboard de métricas + gráfico de funil
6. Stripe (checkout, webhook, customer portal, limites do plano Free)
7. Landing page pública
8. Onboarding do usuário

Testar cada milestone antes de avançar para o próximo.
