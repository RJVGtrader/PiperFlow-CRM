-- =============================================================================
-- PipeFlow CRM — schema inicial multi-tenant (M8)
--
-- Toda tabela de domínio carrega workspace_id e o isolamento entre workspaces é
-- garantido por RLS. Checagens no frontend são só UX: a policy é a defesa real.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums (mesmos valores usados pela UI em types/*.ts)
-- -----------------------------------------------------------------------------

create type public.member_role as enum ('admin', 'membro');

create type public.lead_status as enum ('novo', 'contatado', 'qualificado', 'desqualificado');

create type public.deal_stage as enum (
  'novo_lead',
  'contato_realizado',
  'proposta_enviada',
  'negociacao',
  'fechado_ganho',
  'fechado_perdido'
);

create type public.activity_type as enum ('ligacao', 'email', 'reuniao', 'nota');

create type public.subscription_plan as enum ('free', 'pro');

-- Espelha os status de assinatura do Stripe (gravados pelo webhook no M13).
create type public.subscription_status as enum (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused'
);

-- -----------------------------------------------------------------------------
-- Utilitário: updated_at automático
-- -----------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles: dados públicos do usuário (nome/e-mail), 1:1 com auth.users.
-- auth.users não é exposta pela API; listas de membros, responsáveis e autores
-- leem daqui.
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cria o profile automaticamente no cadastro (Supabase Auth).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- workspaces + membros
-- -----------------------------------------------------------------------------

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 50),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger workspaces_set_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'membro',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index workspace_members_user_id_idx on public.workspace_members (user_id);

-- Convites pendentes (aceite via RPC no M9). E-mail sempre minúsculo.
create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null check (email = lower(email)),
  role public.member_role not null default 'membro',
  token uuid not null unique default gen_random_uuid(),
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  unique (workspace_id, email)
);

-- -----------------------------------------------------------------------------
-- Helpers de autorização usados pelas policies.
-- SECURITY DEFINER: leem workspace_members sem passar pela RLS dela mesma,
-- evitando recursão infinita nas policies de workspace_members.
-- -----------------------------------------------------------------------------

create function public.is_member_of(target_workspace uuid, target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace
      and user_id = target_user
  );
$$;

create function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_member_of(target_workspace, (select auth.uid()));
$$;

create function public.is_workspace_admin(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace
      and user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

-- Usuário logado divide algum workspace com target_user?
create function public.shares_workspace_with(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members mine
    join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id
    where mine.user_id = (select auth.uid())
      and theirs.user_id = target_user
  );
$$;

-- Todo workspace precisa de pelo menos um admin.
create function public.prevent_last_admin_removal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role <> 'admin' or (tg_op = 'UPDATE' and new.role = 'admin') then
    return coalesce(new, old);
  end if;

  -- Exclusões em cascata (workspace ou usuário apagado) não são bloqueadas.
  if not exists (select 1 from public.workspaces where id = old.workspace_id)
     or not exists (select 1 from public.profiles where id = old.user_id) then
    return coalesce(new, old);
  end if;

  if not exists (
    select 1
    from public.workspace_members
    where workspace_id = old.workspace_id
      and role = 'admin'
      and id <> old.id
  ) then
    raise exception 'O workspace precisa de pelo menos um admin.'
      using errcode = 'check_violation';
  end if;

  return coalesce(new, old);
end;
$$;

create trigger workspace_members_keep_one_admin
  before update or delete on public.workspace_members
  for each row execute function public.prevent_last_admin_removal();

-- -----------------------------------------------------------------------------
-- Domínio: leads, deals, activities
-- FKs compostas (id, workspace_id) impedem vincular um negócio/atividade a um
-- lead de outro workspace, mesmo que alguém seja membro dos dois.
-- -----------------------------------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null check (char_length(btrim(name)) >= 2),
  email text,
  phone text,
  company text,
  job_title text,
  status public.lead_status not null default 'novo',
  owner_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id)
);

create index leads_workspace_created_idx on public.leads (workspace_id, created_at desc);
create index leads_workspace_status_idx on public.leads (workspace_id, status);
create index leads_owner_id_idx on public.leads (owner_id);

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid not null,
  title text not null check (char_length(btrim(title)) >= 2),
  value numeric(12, 2) not null default 0 check (value >= 0),
  stage public.deal_stage not null default 'novo_lead',
  owner_id uuid references public.profiles (id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (lead_id, workspace_id) references public.leads (id, workspace_id) on delete cascade
);

create index deals_workspace_stage_idx on public.deals (workspace_id, stage);
create index deals_lead_id_idx on public.deals (lead_id, workspace_id);
create index deals_owner_due_idx on public.deals (owner_id, due_date);

create trigger deals_set_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid not null,
  type public.activity_type not null,
  description text not null check (char_length(btrim(description)) >= 1),
  author_id uuid references public.profiles (id) on delete set null default auth.uid(),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (lead_id, workspace_id) references public.leads (id, workspace_id) on delete cascade
);

create index activities_lead_occurred_idx on public.activities (lead_id, workspace_id, occurred_at desc);
create index activities_workspace_id_idx on public.activities (workspace_id);
create index activities_author_id_idx on public.activities (author_id);

-- -----------------------------------------------------------------------------
-- subscriptions: 1 por workspace. Escrita só pelo backend (service role / webhook
-- do Stripe no M13); membros apenas leem.
-- -----------------------------------------------------------------------------

create table public.subscriptions (
  workspace_id uuid primary key references public.workspaces (id) on delete cascade,
  plan public.subscription_plan not null default 'free',
  status public.subscription_status not null default 'active',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RPC: criar workspace (onboarding / "Criar workspace" na sidebar).
-- Cria workspace + criador como admin + assinatura Free de forma atômica,
-- sem precisar de policy de INSERT direto em workspaces.
-- -----------------------------------------------------------------------------

create function public.create_workspace(workspace_name text)
returns public.workspaces
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_workspace public.workspaces;
begin
  if current_user_id is null then
    raise exception 'Não autenticado.' using errcode = 'insufficient_privilege';
  end if;

  insert into public.workspaces (name, created_by)
  values (btrim(workspace_name), current_user_id)
  returning * into new_workspace;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace.id, current_user_id, 'admin');

  insert into public.subscriptions (workspace_id) values (new_workspace.id);

  return new_workspace;
end;
$$;

-- -----------------------------------------------------------------------------
-- Permissões de execução: helpers e RPC só para usuários autenticados.
-- -----------------------------------------------------------------------------

revoke execute on function public.is_member_of(uuid, uuid) from public, anon;
revoke execute on function public.is_workspace_member(uuid) from public, anon;
revoke execute on function public.is_workspace_admin(uuid) from public, anon;
revoke execute on function public.shares_workspace_with(uuid) from public, anon;
revoke execute on function public.create_workspace(text) from public, anon;
grant execute on function public.create_workspace(text) to authenticated;

-- Funções de trigger não devem ser chamáveis via API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_last_admin_removal() from public, anon, authenticated;

-- =============================================================================
-- Row Level Security
-- Todas as policies são "to authenticated": anon não acessa nada.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invites enable row level security;
alter table public.leads enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.subscriptions enable row level security;

-- profiles: vê o próprio e os de quem divide workspace; edita só o próprio.
create policy "profiles: ver próprio e colegas de workspace"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.shares_workspace_with(id));

create policy "profiles: editar o próprio"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- workspaces: membros veem; admins editam/excluem. Criação via create_workspace().
create policy "workspaces: membros veem"
  on public.workspaces for select to authenticated
  using (public.is_workspace_member(id));

create policy "workspaces: admins editam"
  on public.workspaces for update to authenticated
  using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));

create policy "workspaces: admins excluem"
  on public.workspaces for delete to authenticated
  using (public.is_workspace_admin(id));

-- workspace_members: membros veem a equipe; admins gerenciam; qualquer um pode sair.
create policy "workspace_members: membros veem a equipe"
  on public.workspace_members for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "workspace_members: admins adicionam"
  on public.workspace_members for insert to authenticated
  with check (public.is_workspace_admin(workspace_id));

create policy "workspace_members: admins alteram papel"
  on public.workspace_members for update to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy "workspace_members: admins removem ou o próprio sai"
  on public.workspace_members for delete to authenticated
  using (public.is_workspace_admin(workspace_id) or user_id = (select auth.uid()));

-- workspace_invites: só admins.
create policy "workspace_invites: admins veem"
  on public.workspace_invites for select to authenticated
  using (public.is_workspace_admin(workspace_id));

create policy "workspace_invites: admins criam"
  on public.workspace_invites for insert to authenticated
  with check (public.is_workspace_admin(workspace_id) and invited_by = (select auth.uid()));

create policy "workspace_invites: admins reenviam"
  on public.workspace_invites for update to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy "workspace_invites: admins cancelam"
  on public.workspace_invites for delete to authenticated
  using (public.is_workspace_admin(workspace_id));

-- leads: qualquer membro (PRD: membro trabalha com leads e negócios).
-- Responsável, quando informado, precisa ser membro do workspace.
create policy "leads: membros veem"
  on public.leads for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "leads: membros criam"
  on public.leads for insert to authenticated
  with check (
    public.is_workspace_member(workspace_id)
    and (owner_id is null or public.is_member_of(workspace_id, owner_id))
  );

create policy "leads: membros editam"
  on public.leads for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (
    public.is_workspace_member(workspace_id)
    and (owner_id is null or public.is_member_of(workspace_id, owner_id))
  );

create policy "leads: membros excluem"
  on public.leads for delete to authenticated
  using (public.is_workspace_member(workspace_id));

-- deals: mesmas regras de leads.
create policy "deals: membros veem"
  on public.deals for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "deals: membros criam"
  on public.deals for insert to authenticated
  with check (
    public.is_workspace_member(workspace_id)
    and (owner_id is null or public.is_member_of(workspace_id, owner_id))
  );

create policy "deals: membros editam"
  on public.deals for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (
    public.is_workspace_member(workspace_id)
    and (owner_id is null or public.is_member_of(workspace_id, owner_id))
  );

create policy "deals: membros excluem"
  on public.deals for delete to authenticated
  using (public.is_workspace_member(workspace_id));

-- activities: membros veem e registram (sempre como autor); só o autor ou um
-- admin edita/exclui.
create policy "activities: membros veem"
  on public.activities for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "activities: membros registram como autor"
  on public.activities for insert to authenticated
  with check (public.is_workspace_member(workspace_id) and author_id = (select auth.uid()));

create policy "activities: autor ou admin edita"
  on public.activities for update to authenticated
  using (
    public.is_workspace_member(workspace_id)
    and (author_id = (select auth.uid()) or public.is_workspace_admin(workspace_id))
  )
  with check (public.is_workspace_member(workspace_id));

create policy "activities: autor ou admin exclui"
  on public.activities for delete to authenticated
  using (
    public.is_workspace_member(workspace_id)
    and (author_id = (select auth.uid()) or public.is_workspace_admin(workspace_id))
  );

-- subscriptions: membros só leem.
create policy "subscriptions: membros veem"
  on public.subscriptions for select to authenticated
  using (public.is_workspace_member(workspace_id));
