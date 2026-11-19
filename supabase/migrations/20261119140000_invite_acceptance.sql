-- =============================================================================
-- Convites: visualização e aceite (M9)
--
-- O convidado ainda não é membro, então a RLS não o deixa ler o convite nem o
-- workspace. Duas RPCs SECURITY DEFINER cobrem o fluxo, ambas exigindo o token
-- (uuid aleatório enviado só por e-mail):
--   * get_invite(token): dados mínimos para a tela de aceite (também para anon,
--     que ainda vai fazer login/cadastro).
--   * accept_invite(token): valida expiração e e-mail, cria a membership e
--     consome o convite de forma atômica.
-- =============================================================================

-- Data do último envio (o "Reenviar" atualiza; created_at fica como histórico).
alter table public.workspace_invites
  add column last_sent_at timestamptz not null default now();

update public.workspace_invites set last_sent_at = created_at;

create function public.get_invite(invite_token uuid)
returns table (
  workspace_name text,
  email text,
  role public.member_role,
  invited_by_name text,
  expires_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select w.name, i.email, i.role, p.full_name, i.expires_at
  from public.workspace_invites i
  join public.workspaces w on w.id = i.workspace_id
  left join public.profiles p on p.id = i.invited_by
  where i.token = invite_token;
$$;

create function public.accept_invite(invite_token uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  invite public.workspace_invites;
  user_email text;
  user_confirmed boolean;
begin
  if current_user_id is null then
    raise exception 'Faça login para aceitar o convite.' using errcode = 'insufficient_privilege';
  end if;

  select * into invite
  from public.workspace_invites
  where token = invite_token
  for update;

  if not found then
    raise exception 'Convite inválido ou já utilizado.' using errcode = 'no_data_found';
  end if;

  if invite.expires_at < now() then
    raise exception 'Este convite expirou. Peça um novo ao admin do workspace.'
      using errcode = 'check_violation';
  end if;

  select lower(u.email), u.email_confirmed_at is not null
  into user_email, user_confirmed
  from auth.users u
  where u.id = current_user_id;

  -- Sem isso, qualquer conta poderia aceitar um convite cujo link vazou.
  if user_email is distinct from invite.email then
    raise exception 'Este convite foi enviado para outro e-mail.'
      using errcode = 'insufficient_privilege';
  end if;

  -- Impede que alguém cadastre o e-mail do convidado sem ter acesso à caixa dele.
  if not user_confirmed then
    raise exception 'Confirme seu e-mail antes de aceitar o convite.'
      using errcode = 'insufficient_privilege';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (invite.workspace_id, current_user_id, invite.role)
  on conflict (workspace_id, user_id) do nothing;

  delete from public.workspace_invites where id = invite.id;

  return invite.workspace_id;
end;
$$;

revoke execute on function public.get_invite(uuid) from public;
grant execute on function public.get_invite(uuid) to anon, authenticated;

revoke execute on function public.accept_invite(uuid) from public, anon;
grant execute on function public.accept_invite(uuid) to authenticated;
