# PipeFlow CRM

CRM SaaS multi-empresa com pipeline Kanban de vendas. Ver [CLAUDE.md](CLAUDE.md) para stack, convenções e estrutura, e [docs/PRD.md](docs/PRD.md) / [docs/ROADMAP.md](docs/ROADMAP.md) para especificação e plano de execução.

## Stack

Next.js 14 (App Router) + TypeScript 5 (strict) + Tailwind CSS + shadcn/ui + Supabase (Postgres + Auth + RLS) + Stripe + Resend + @dnd-kit + Recharts. Deploy: Vercel + Supabase.

## Pré-requisitos

- Node.js 20+
- npm
- [Docker](https://www.docker.com/) (necessário para rodar o Supabase localmente)
- Conta [Supabase](https://supabase.com) e conta [Vercel](https://vercel.com)

## Setup local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie as variáveis de ambiente:

   ```bash
   cp .env.example .env.local
   ```

3. Suba o Supabase local (Postgres + Auth + Studio rodando em Docker):

   ```bash
   npx supabase start
   ```

   Isso imprime as chaves locais (`API URL`, `anon key`, `service_role key`). Cole-as em `.env.local`. Por padrão a API local sobe em `http://127.0.0.1:54321` e o Studio em `http://127.0.0.1:54323`.

4. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000).

### Conectando a um projeto Supabase real (staging/produção)

O CLI já está inicializado neste repo (`supabase/config.toml`). Para linkar a um projeto real:

```bash
npx supabase login       # abre o navegador para autenticação
npx supabase link --project-ref <seu-project-ref>
```

Depois, pegue `Project URL`, `anon key` e `service_role key` em **Project Settings > API** no dashboard do Supabase e preencha `.env.local` (ou as env vars do projeto na Vercel, para produção).

### Banco de dados: migrations, seed e tipos

O projeto Supabase linkado (`Pipeflow CRM`) é o ambiente de **dev/staging**. Produção será um projeto separado (M15), que recebe só as migrations, **nunca o seed**.

- Schema e policies RLS: `supabase/migrations/`
- Dados de teste: `supabase/seed.sql`

```bash
npx supabase@2 db push --linked                  # aplica migrations novas
npx supabase@2 db push --linked --include-seed   # + seed (somente dev/staging!)
npm run db:types                                 # regera os tipos TypeScript
npm run test:rls                                 # testa o isolamento entre workspaces
```

Se o CLI falhar com `Failed to create login role`, defina `SUPABASE_DB_PASSWORD` no `.env.local` (Project Settings > Database) e passe `--password "$SUPABASE_DB_PASSWORD"`.

Usuários de teste do seed (senha `pipeflow123` para todos):

| E-mail                     | Acesso                                              |
| -------------------------- | --------------------------------------------------- |
| `ana@acmevendas.com`       | Admin da Acme Vendas (Pro) e da Agência Nova (Free) |
| `bruna@acmevendas.com`     | Admin da Acme Vendas                                |
| `carlos@acmevendas.com`    | Membro da Acme Vendas                               |
| `rafael@acmevendas.com`    | Membro da Acme Vendas                               |
| `pedro@agencianova.com.br` | Membro da Agência Nova                              |

### Conectando à Vercel

```bash
npx vercel login   # abre o navegador para autenticação
npx vercel link     # linka esta pasta a um projeto Vercel
```

Depois configure as mesmas variáveis de `.env.example` em **Project Settings > Environment Variables** na Vercel (Preview e Production).

## Scripts

| Comando                | Descrição                                |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento              |
| `npm run build`        | Build de produção                        |
| `npm run start`        | Roda o build de produção                 |
| `npm run lint`         | ESLint                                   |
| `npm run format`       | Formata o código com Prettier            |
| `npm run format:check` | Verifica formatação sem alterar arquivos |
| `npm run db:types`     | Regera `lib/supabase/database.types.ts`  |
| `npm run test:rls`     | Testa o isolamento RLS no banco de dev   |

## Componentes shadcn/ui

Componentes em `components/ui/` são gerados via CLI, não editados à mão:

```bash
npx shadcn@2.10.0 add <componente>
```

(A versão do CLI está fixada em `2.10.0` porque versões mais recentes migraram para Tailwind v4/Base UI, incompatível com o Tailwind v3 usado neste projeto.)
